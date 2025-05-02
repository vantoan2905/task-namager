import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Task } from './task.model';

@Entity('task_types')
export class TaskType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column( )
  type: string;

  @Column({default: ''})
  description: string;

  @OneToMany(() => Task, (task) => task.type)
  tasks: Task[];
}