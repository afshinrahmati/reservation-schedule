export class ListBookingsFilterDto {
  page?: number;
  pageSize?: number;
  roomId?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: 'CONFIRMED';
}
