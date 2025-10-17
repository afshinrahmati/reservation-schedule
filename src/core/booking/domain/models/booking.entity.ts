import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';
import { BookingStatus } from '@/core/booking/domain/enums/booking-status.enum';

@Entity('bookings')
export class Booking {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index()
    @Column()
    roomId: string;

    @Index()
    @Column()
    userId: string;

    @Index()
    @Column({ type: 'datetime' })
    startAt: Date;

    @Index()
    @Column({ type: 'datetime' })
    endAt: Date;

    @Index()
    @Column({ type: 'enum', enum: BookingStatus })
    status: BookingStatus;

    @CreateDateColumn({ type: 'datetime' })
    createdAt: Date;
}