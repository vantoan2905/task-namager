import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskType } from '../models/task-type.model';
import { TaskStatus } from '../models/task-status.model';
import { TaskPriority } from '../models/task-priority.model';
import { TaskLabel } from '../models/task-label.model';

@Injectable()
export class SeederService {
  constructor(
    @InjectRepository(TaskType)
    private readonly taskTypeRepository: Repository<TaskType>,
    @InjectRepository(TaskStatus)
    private readonly taskStatusRepository: Repository<TaskStatus>,
    @InjectRepository(TaskPriority)
    private readonly taskPriorityRepository: Repository<TaskPriority>,
    @InjectRepository(TaskLabel)
    private readonly taskLabelRepository: Repository<TaskLabel>,
  ) {}

  async seed() {
    console.log('[SeederService] Seeding started...');
    await this.seedTaskTypes();
    await this.seedTaskStatuses();
    await this.seedTaskPriorities();
    await this.seedTaskLabels();
    console.log('[SeederService] Seeding finished.');
  }
  

  private async seedTaskTypes() {
    const count = await this.taskTypeRepository.count();
    if (count === 0) {
      await this.taskTypeRepository.insert([
        { type: 'EPIC', description: 'EPIC, US, TASK,BUG, SUBTASK' },
        { type: 'US', description: 'EPIC, US, TASK,BUG, SUBTASK' },
        { type: 'TASK', description: 'EPIC, US, TASK,BUG, SUBTASK' },
        { type: 'BUG', description: 'EPIC, US, TASK,BUG, SUBTASK' },
        { type: 'SUBTASK', description: 'EPIC, US, TASK,BUG, SUBTASK' },
      ]); 
      console.log('Seeded TaskTypes');
    }
  }
  private async seedTaskStatuses() {
    const count = await this.taskStatusRepository.count();
    if (count === 0) {
      await this.taskStatusRepository.insert([
        { status: 'To Do', description: 'To Do' },
        { status: 'In Progress' , description: 'In Progress' },
        { status: 'Done' , description: 'Done' },
        { status: 'Blocked' , description: 'Blocked' },
      ]);
      console.log('Seeded TaskStatuses');
    }
  }
  private async seedTaskPriorities() {
    const count = await this.taskPriorityRepository.count();
    if (count === 0) {
      await this.taskPriorityRepository.insert([
        { priority: 'Low', description: 'Low' },
        { priority: 'Medium', description: 'Medium' },
        { priority: 'High', description: 'High' },
      ]);
      console.log('Seeded TaskPriorities');
    }
  }
  private async seedTaskLabels() {
    const count = await this.taskLabelRepository.count();
    if (count === 0) {
      await this.taskLabelRepository.insert([
        { type: 'Frontend' , description: 'Frontend' },
        { type: 'Backend' , description: 'Backend' },
        { type: 'Database' ,description: 'Database' },
      ]);
      console.log('Seeded TaskLabels');
    }
  }
}
