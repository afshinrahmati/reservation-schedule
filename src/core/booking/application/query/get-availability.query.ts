export class GetAvailabilityQuery {
  constructor(
    public readonly roomId: string,
    public readonly from: Date,
    public readonly to: Date,
    public readonly slotDurationMin: number,
  ) {}
}