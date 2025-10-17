export class RoomModel {
    constructor(
        public readonly id: string,
        public ownerId: string,
        public name: string,
        public slotDurationMinutes: number,
        public createdAt: Date = new Date(),
    ) {}

    changeName(name: string) {
        if (!name.trim()) throw new Error('Room name cannot be empty');
        this.name = name;
    }
}