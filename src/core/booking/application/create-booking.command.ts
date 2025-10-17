export class CreateBookingCommand {
    constructor(
        public readonly userId: string,
        public readonly roomId: string,
        public readonly startAt: Date,
        public readonly endAt: Date,
    ) {}
}