import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Task } from './task.model';

@Entity('task_priorities')
export class TaskPriority {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  priority: string;

  @Column( {default: ''} )
  description: string;

  @OneToMany(() => Task, (task) => task.priority)
  tasks: Task[];
}