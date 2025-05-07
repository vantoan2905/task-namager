import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from './user.model';
import { TaskType } from './task-type.model';
import { TaskStatus } from './task-status.model';
import { TaskPriority } from './task-priority.model';
import { TaskLabel } from './task-label.model';
import { Comment } from './comment.model';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string; 

  @Column()
  description: string;

  @ManyToOne(() => TaskType, (taskType) => taskType.tasks)
  @JoinColumn({ name: 'type_id' })
  type: TaskType;

  @ManyToOne(() => TaskStatus, (taskStatus) => taskStatus.tasks)
  @JoinColumn({ name: 'status_id' })
  status: TaskStatus;

  @ManyToOne(() => TaskPriority, (taskPriority) => taskPriority.tasks)
  @JoinColumn({ name: 'priority_id' })
  priority: TaskPriority;

  @ManyToOne(() => TaskLabel, (taskLabel) => taskLabel.tasks)
  @JoinColumn({ name: 'label_id' })
  label: TaskLabel;

  // <-- Thêm @JoinColumn để map đúng cột FK trong DB
  @ManyToOne(() => User, (user) => user.tasks)
  @JoinColumn({ name: 'assigned_user_id' })
  assigned_user: User;

  @OneToMany(() => Comment, (comment) => comment.task)
  comments: Comment[];

  @Column()
  date_start: Date;

  @Column()
  date_stop: Date;
}
