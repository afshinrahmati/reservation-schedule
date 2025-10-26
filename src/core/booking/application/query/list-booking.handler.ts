import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { BookingRepoPort } from '@/core/booking/application/ports/booking-repo.port';
import {
  ListAdminBookingsQuery,
  ListHostBookingsQuery,
  ListMyBookingsQuery,
} from './list-bookings.query';

@QueryHandler(ListMyBookingsQuery)
export class ListMyBookingsHandler
  implements IQueryHandler<ListMyBookingsQuery>
{
  constructor(private readonly repo: BookingRepoPort) {}
  execute(q: ListMyBookingsQuery) {
    return this.repo.search({ kind: 'USER', userId: q.userId }, q.filter);
  }
}

@QueryHandler(ListHostBookingsQuery)
export class ListHostBookingsHandler
  implements IQueryHandler<ListHostBookingsQuery>
{
  constructor(private readonly repo: BookingRepoPort) {}
  execute(q: ListHostBookingsQuery) {
    return this.repo.search({ kind: 'HOST', ownerId: q.ownerId }, q.filter);
  }
}
@QueryHandler(ListAdminBookingsQuery)
export class ListAdminBookingsHandler
  implements IQueryHandler<ListAdminBookingsQuery>
{
  constructor(private readonly repo: BookingRepoPort) {}
  execute(q: ListAdminBookingsQuery) {
    return this.repo.search({ kind: 'ADMIN' }, q.filter);
  }
}
