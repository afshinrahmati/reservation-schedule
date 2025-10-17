import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('rooms')
export class Room {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index()
    @Column()
    ownerId: string;

    @Column()
    name: string;

    @Column({ type: 'int', default: 60 })
    slotDurationMinutes: number;

    @CreateDateColumn()
    createdAt: Date;
}