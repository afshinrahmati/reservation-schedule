import { BookingSearchFilter } from '../ports/booking-repo.port';

export class ListMyBookingsQuery {
  constructor(
    public readonly userId: string,
    public readonly filter: BookingSearchFilter,
  ) {}
}
export class ListHostBookingsQuery {
  constructor(
    public readonly ownerId: string,
    public readonly filter: BookingSearchFilter,
  ) {}
}

export class ListAdminBookingsQuery {
  constructor(public readonly filter: BookingSearchFilter) {}
}
