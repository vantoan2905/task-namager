
import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { Task } from 'src/models/task.model';
import { TaskLabel } from 'src/models/task-label.model';
import { TaskType } from 'src/models/task-type.model';
import { TaskStatus } from 'src/models/task-status.model';
import { TaskPriority } from 'src/models/task-priority.model';
import { Session } from 'src/models/session.model';
import { User } from 'src/models/user.model';

import { CreateTaskDto } from 'src/dto/task/create-task.dto';
import { updateTaskDto } from 'src/dto/task/update-task.dto';
import { CreateTaskLabelDto } from 'src/dto/task/create-task-label.dto';
@Injectable()
export class TaskManagerService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(TaskLabel)
    private readonly taskLabelRepository: Repository<TaskLabel>,
    @InjectRepository(TaskType)
    private readonly taskTypeRepository: Repository<TaskType>,
    @InjectRepository(TaskStatus)
    private readonly taskStatusRepository: Repository<TaskStatus>,
    @InjectRepository(TaskPriority)
    private readonly taskPriorityRepository: Repository<TaskPriority>,
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Create a new task
  async createTask(username: string, taskDto: CreateTaskDto): Promise<{ id: number }> {
    const user = await this.userRepository.findOneBy({ username });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { name, description, type_id, status_id, priority_id, label_id, time_start, time_stop } = taskDto;
    const newTask = this.taskRepository.create({
      name,
      description,
      type: { id: type_id },
      status: { id: status_id },
      priority: { id: priority_id },
      label: { id: label_id },
      assigned_user: user,
      date_start: time_start,
      date_stop: time_stop,
    });

    await this.taskRepository.save(newTask);
    return { id: newTask.id };
  }

  // Get all tasks for a user async getAllTasks(username: string): Promise<{ tasks: Task[] }> {

  async getAllTasks(email: string): Promise<{ tasks: Task[] }> {
      const user = await this.userRepository.findOneBy({ email });
      if (!user) {
        throw new NotFoundException('User not found');
      }
  
      const tasks = await this.taskRepository.find({
        where: { assigned_user: { id: user.id } },
        relations: ['type', 'status', 'priority', 'label'],
      });
      return { tasks: tasks };
    }


  async deleteTask(id: string): Promise<{ id: number }> {
    const idInt = parseInt(id, 10);
    const task = await this.taskRepository.findOneBy({ id: idInt });
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    await this.taskRepository.remove(task);
    return { id: idInt };
  }

  // Update a task by ID
  async updateTask(id: string, dto: updateTaskDto): Promise<{ id: number }> {
    const idInt = parseInt(id, 10);
    const task = await this.taskRepository.findOneBy({ id: idInt });
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const { name, description, time_start, time_stop } = dto;
    task.name = name;
    task.description = description;
    task.date_start = new Date(time_start);
    task.date_stop = new Date(time_stop);

    await this.taskRepository.save(task);
    return { id: task.id };
  }

  // Get a task by ID
  async getTaskById(id: string): Promise<{ task: Task }> {
    const idInt = parseInt(id, 10);
    const task = await this.taskRepository.findOne({
      where: { id: idInt },
      relations : ['type', 'status', 'priority', 'label'],
    })
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return { task: task };
  }

  // Get all task types
  async getTypeTask(): Promise<{ taskTypes: TaskType[] }> {
    const types = await this.taskTypeRepository.find();
    if (types.length === 0) {
      throw new NotFoundException('No task types found');
    }
    return { taskTypes: types };
  }

  // Get all task statuses
  async getStatusTask(): Promise<{ taskStatuses: TaskStatus[] }> {
    const statuses = await this.taskStatusRepository.find();
    if (statuses.length === 0) {
      throw new NotFoundException('No task statuses found');
    }
    return { taskStatuses: statuses };
  }

  // Get all task priorities
  async getPriorityTask(): Promise<{ taskPriorities: TaskPriority[] }> {
    const priorities = await this.taskPriorityRepository.find();
    if (priorities.length === 0) {
      throw new NotFoundException('No task priorities found');
    }
    return { taskPriorities: priorities };
  }

  // Get all task labels
  async getLabelTask(): Promise<{ taskLabels: TaskLabel[] }> {
    const labels = await this.taskLabelRepository.find();
    if (labels.length === 0) {
      throw new NotFoundException('No task labels found');
    }
    return { taskLabels: labels };
  }
  // Create a new task label
  async createTaskLabel(labelDto: CreateTaskLabelDto): Promise<{ id: number }> {
    const { label_id, messege } = labelDto;
    const newLabel = this.taskLabelRepository.create({
      id : label_id,
      description : messege
    });
  
    await this.taskLabelRepository.save(newLabel);
    return { id: newLabel.id };
  }
}
