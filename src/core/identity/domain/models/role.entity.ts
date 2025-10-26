import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('roles')
export class RoleEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Index({ unique: true }) @Column('text') code: 'ADMIN' | 'HOST' | 'GUEST';
  @Column('text') name: string;
  @CreateDateColumn({ type: 'timestamptz' }) createdAt: Date;
}
