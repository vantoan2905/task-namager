// filepath: d:\working\first_project\first_project\server_v2\task-namager\src\models\user.model.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Session } from './session.model';
import { VerificationCode } from './verification-code.model';
import { Task } from './task.model'; // Import Task entity
import { Comment } from './comment.model';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Session, (session) => session.user)
  sessions: Session[];

  @OneToMany(() => VerificationCode, (code) => code.user)
  verificationCodes: VerificationCode[];

  @OneToMany(() => Task, (task) => task.assigned_user) 
  tasks: Task[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];
}