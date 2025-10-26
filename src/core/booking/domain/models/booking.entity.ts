import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BookingStatus } from '../enums/booking-status.enum';

@Entity('bookings')
export class BookingEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid', { name: 'room_id' }) roomId: string;
  @Column('uuid', { name: 'user_id' }) userId: string;
  @Column('timestamptz', { name: 'start_at' }) startAt: Date;
  @Column('timestamptz', { name: 'end_at' }) endAt: Date;
  @Column('text') status: BookingStatus;
  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
