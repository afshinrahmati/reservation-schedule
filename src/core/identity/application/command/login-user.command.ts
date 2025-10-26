export class LoginUserCommand {
  constructor(public readonly dto: { email: string; password: string }) {}
}
