import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Task } from './task.model';

@Entity('task_statuses')
export class TaskStatus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  status: string;

  @Column( {default: ''} )
  description: string;

  @OneToMany(() => Task, (task) => task.status)
  tasks: Task[];
}