export class CreateRoomCommand {
    constructor(
        public readonly ownerId: string,
        public readonly name: string,
        public readonly slotDurationMinutes: number,
    ) {}
}