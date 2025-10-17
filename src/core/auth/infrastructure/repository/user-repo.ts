import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import {UserRole} from "@/core/auth/domain/enum/user-role.enum";

@Entity('users')
export class UserOrmEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column()
    passwordHash: string;

    @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
    role: UserRole;

    @CreateDateColumn()
    createdAt: Date;
}
