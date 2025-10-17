import {UserRole} from "../enum/user-role.enum";

export class User {
    constructor(
        public readonly id: string,
        public email: string,
        public passwordHash: string,
        public role: UserRole = UserRole.USER,
        public readonly createdAt: Date = new Date(),
    ) {}

    static register(id: string, email: string, passwordHash: string): User {
        return new User(id, email, passwordHash, UserRole.USER);
    }
}