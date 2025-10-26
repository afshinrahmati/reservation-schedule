import { BookingEntity } from '../../domain/models/booking.entity';

export type BookingSearchScope =
  | { kind: 'ADMIN' }
  | { kind: 'HOST'; ownerId: string }
  | { kind: 'USER'; userId: string };

export interface BookingSearchFilter {
  page?: number;
  pageSize?: number;
  roomId?: string;
  userId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  status?: 'CONFIRMED';
}

export interface BookingSearchResult {
  items: Array<{
    id: string;
    roomId: string;
    userId: string;
    startAt: Date;
    endAt: Date;
    status: 'CONFIRMED';
    roomName?: string;
  }>;
  page: number;
  pageSize: number;
  total: number;
}

export abstract class BookingRepoPort {
  abstract save(b: Partial<BookingEntity>): Promise<BookingEntity>;
  abstract findById(id: string): Promise<BookingEntity | null>;

  // ✅ جدید:
  abstract search(
    scope: BookingSearchScope,
    filter: BookingSearchFilter,
  ): Promise<BookingSearchResult>;
}
