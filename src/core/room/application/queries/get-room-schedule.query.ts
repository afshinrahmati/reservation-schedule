export class GetRoomDailyScheduleQuery {
  constructor(
    public readonly roomId: string,
    public readonly fromDate: Date,
    public readonly days: number = 15,
  ) {}
}
