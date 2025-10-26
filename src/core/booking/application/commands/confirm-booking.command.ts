export class ConfirmCommand {
  constructor(
    public readonly userId: string,
    public readonly token: string,
  ) {}
}
