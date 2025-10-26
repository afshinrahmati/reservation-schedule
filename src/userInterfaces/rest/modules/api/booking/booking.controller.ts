import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateBookingDto } from '@/core/booking/application/dto/create-booking.dto';
import { CreateBookingCommand } from '@/core/booking/application/commands/create-booking.command';
import { ConfirmCommand } from '@/core/booking/application/commands/confirm-booking.command';
import { ConfirmDto } from '@/core/booking/application/dto/confirm-booking.dto';
import { AuthApiGuard } from '@/userInterfaces/rest/components/guards/auth-api.guard';
import {
  ListAdminBookingsQuery,
  ListHostBookingsQuery,
  ListMyBookingsQuery,
} from '@/core/booking/application/query/list-bookings.query';
import { BookingSearchFilter } from '@/core/booking/application/ports/booking-repo.port';
import { Roles } from '@/userInterfaces/rest/components/decorators/roles.decorator';

@UseGuards(AuthApiGuard)
@ApiBearerAuth()
@ApiTags('Bookings')
@Controller('bookings')
export class BookingController {
  constructor(
    private cmd: CommandBus,
    private readonly qb: QueryBus,
  ) {}
  @Post() create(@Body() dto: CreateBookingDto, @Req() req) {
    return this.cmd.execute(new CreateBookingCommand(req.user.id, dto));
  }
  @Post('confirm') confirm(@Body() dto: ConfirmDto, @Req() req) {
    return this.cmd.execute(new ConfirmCommand(req.user.id, dto.token));
  }
  @Get('me')
  @Roles('GUEST', 'HOST', 'ADMIN')
  my(@Req() req, @Query() q: any) {
    const filter: BookingSearchFilter = {
      page: q.page ? Number(q.page) : undefined,
      pageSize: q.pageSize ? Number(q.pageSize) : undefined,
      roomId: q.roomId,
      dateFrom: q.dateFrom ? new Date(q.dateFrom) : undefined,
      dateTo: q.dateTo ? new Date(q.dateTo) : undefined,
    };
    return this.qb.execute(new ListMyBookingsQuery(req.user.id, filter));
  }

  @Get('owner')
  @Roles('HOST', 'ADMIN')
  owner(@Req() req, @Query() q: any) {
    const filter: BookingSearchFilter = {
      page: q.page ? Number(q.page) : undefined,
      pageSize: q.pageSize ? Number(q.pageSize) : undefined,
      roomId: q.roomId,
      dateFrom: q.dateFrom ? new Date(q.dateFrom) : undefined,
      dateTo: q.dateTo ? new Date(q.dateTo) : undefined,
    };
    return this.qb.execute(new ListHostBookingsQuery(req.user.id, filter));
  }

  @Get('admin')
  @Roles('ADMIN')
  admin(@Query() q: any) {
    const filter: BookingSearchFilter = {
      page: q.page ? Number(q.page) : undefined,
      pageSize: q.pageSize ? Number(q.pageSize) : undefined,
      roomId: q.roomId,
      userId: q.userId,
      dateFrom: q.dateFrom ? new Date(q.dateFrom) : undefined,
      dateTo: q.dateTo ? new Date(q.dateTo) : undefined,
    };
    return this.qb.execute(new ListAdminBookingsQuery(filter));
  }
}
