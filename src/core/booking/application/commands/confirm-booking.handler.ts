import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {ConfirmBookingCommand} from "./confirm-booking.command";
import {EventBusPort} from "../../../_shared/application/ports/event-bus.port";
import {BookingRepoPort} from "../ports/booking-repo.port";
import {DataSource} from "typeorm";
import { ErrorCodes } from '@/core/_shared/errors/error-codes';
import { err } from '@/core/_shared/errors/factory';
import {BookingStatus} from "../../domain/enums/booking-status.enum";
@CommandHandler(ConfirmBookingCommand)
export class ConfirmBookingHandler implements ICommandHandler<ConfirmBookingCommand> {
    constructor(private ds:DataSource, private repo:BookingRepoPort, private bus:EventBusPort) {}
    async execute({ userId, bookingId }: ConfirmBookingCommand) {
        await this.ds.transaction(async em => {
            const b = await this.repo.findById(bookingId);
            if (!b) throw err.notFound(ErrorCodes.BOOKING.NOT_FOUND, 'رزرو پیدا نشد');
            if (b.userId !== userId) throw err.forbidden(ErrorCodes.IDENTITY.FORBIDDEN, 'اجازه تایید این رزرو را ندارید');
            if (b.status !== BookingStatus.PENDING) throw err.badRequest(ErrorCodes.BOOKING.INVALID_STATE, 'رزرو در وضعیت قابل تایید نیست');
            b.status = BookingStatus.CONFIRMED;
            await this.repo.save(b);
        });
        await this.bus.publish('booking.confirmed', { bookingId, userId });
        return { ok: true };
    }
}