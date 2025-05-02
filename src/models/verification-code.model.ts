import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './user.model';

@Entity('verification_codes')
export class VerificationCode {
  @PrimaryGeneratedColumn()
  code_id: number;

  @ManyToOne(() => User, (user) => user.verificationCodes)
  user: User;

  @Column()
  channel: string;

  @Column()
  otp: string;

  @Column()
  message: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  expires_at: Date;

  @Column()
  revoked: boolean;
}