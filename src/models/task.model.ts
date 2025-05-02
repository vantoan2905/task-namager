import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.model';
import { TaskType } from './task-type.model';
import { TaskStatus } from './task-status.model';
import { TaskPriority } from './task-priority.model';
import { TaskLabel } from './task-label.model';
@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string; 

  @Column()
  description: string;

  @ManyToOne(() => TaskType, (taskType) => taskType.tasks)
  type: TaskType;

  @ManyToOne(() => TaskStatus, (taskStatus) => taskStatus.tasks)
  status: TaskStatus;

  @ManyToOne(() => TaskPriority, (taskPriority) => taskPriority.tasks)
  priority: TaskPriority;

  @ManyToOne(() => TaskLabel, (taskLabel) => taskLabel.tasks)
  label: TaskLabel;

  @ManyToOne(() => User, (user) => user.tasks)
  assigned_user: User;

  @Column()
  date_start: Date;

  @Column()
  date_stop: Date;

}
