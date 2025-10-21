import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { RoleEntity } from './role.entity';
@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('text', { unique: true }) email: string;
  @Column('text', { name: 'password_hash' }) passwordHash: string;
  @Column('text', { name: 'full_name', nullable: true }) fullName?: string;
  @Column('boolean', { name: 'is_active', default: true }) isActive: boolean;
  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' }) updatedAt: Date;

  @ManyToMany(() => RoleEntity, { eager: true })
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: RoleEntity[];
}