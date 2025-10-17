export class ConfirmBookingCommand {
    constructor(public readonly userId: string, public readonly bookingId: string) {}
}