import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
@Entity('rooms')
export class RoomEntity {
    @PrimaryGeneratedColumn('uuid') id: string;
    @Column('uuid', { name: 'owner_id', nullable: true }) ownerId: string | null;
    @Column('text') name: string;
    @Column('int', { name: 'slot_duration_min' }) slotDurationMin: number;
    @CreateDateColumn({ type: 'timestamptz', name: 'created_at' }) createdAt: Date;
}