import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Task } from './task.model';

@Entity('task_labels')
export class TaskLabel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  @Column({ default: '' })
  description: string;

  @OneToMany(() => Task, (task) => task.label)
  tasks: Task[];
}