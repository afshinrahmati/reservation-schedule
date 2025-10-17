export class UserRegisteredEvent {
    constructor(
        public readonly userId: string,
        public readonly email: string,
        public readonly createdAt: Date = new Date(),
    ) {}
}