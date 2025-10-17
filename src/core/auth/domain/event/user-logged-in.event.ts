export class UserLoggedInEvent {
    constructor(
        public readonly userId: string,
        public readonly email: string,
        public readonly loggedInAt: Date = new Date(),
    ) {}
}