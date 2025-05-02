import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './user.model';

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn()
  session_id: number;

  @ManyToOne(() => User, (user) => user.sessions)
  user: User;

  @Column()
  access_token: string;

  @Column()
  access_expires_at: Date;

  @Column()
  refresh_token: string;

  @Column()
  refresh_expires_at: Date;

  @Column()
  revoked: boolean;

  @CreateDateColumn()
  issued_at: Date;
}