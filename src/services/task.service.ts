import { Injectable } from '@nestjs/common';
import { Task } from 'src/models/task.model';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskLabel } from 'src/models/task-label.model';
import { TaskType } from 'src/models/task-type.model';
import { TaskStatus } from 'src/models/task-status.model';
import { TaskPriority } from 'src/models/task-priority.model';
import { Session } from 'src/models/session.model';
import { User } from 'src/models/user.model';
import { ResponseDto } from 'src/dto/user/response.dto';
import { CreateTaskDto } from 'src/dto/task/create-task.dto';
import { updateTaskDto } from 'src/dto/task/update-task.dto';
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
    // session
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
    // user
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  // --------------------------------------------------------------------------------------------------------------
  // create task
  // --------------------------------------------------------------------------------------------------------------
  /**
   * Create a new task
   * @param username username of the task owner
   * @param taskDto task data
   * @returns a response with the task ID
   * @throws {Error} if the user is not found
   */
  async createTask(username: string, taskDto: CreateTaskDto): Promise<ResponseDto<string>> {
    const user  = await this.userRepository.findOneBy({ username });
    if (!user) {
      throw new Error('User not found');
    }
    const { name, description, type_id, status_id, priority_id , label_id, time_start, time_stop } = taskDto;
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
    const data_response = `Task created successfully with ID: ${newTask.id}`;
    return ResponseDto.successResponse(data_response, 'Thành công');
  }
  
  // --------------------------------------------------------------------------------------------------------------
  // get all task
  // --------------------------------------------------------------------------------------------------------------
  /**
   * Retrieve all tasks of a given user
   * @param username username of the task owner
   * @returns a response with an array of tasks
   * @throws {Error} if the user is not found
   */
  async getAllTasks(username: string): Promise<any> {
    const user = await this.userRepository.findOneBy({ username });
    if (!user) {
      throw new Error('User not found');
    }
    const tasks = await this.taskRepository.find({ where: { assigned_user: user } });
    return ResponseDto.successResponse({ tasks }, 'Thành công');
  }
  // --------------------------------------------------------------------------------------------------------------
  // delete task
  // --------------------------------------------------------------------------------------------------------------
  
  /**
   * Delete a task by its ID
   * @param id the ID of the task to delete
   * @returns a response with the task ID
   * @throws {Error} if the task is not found
   */
  async deleteTask(id: string): Promise<ResponseDto<string>> {
    const id_int = parseInt(id);
    const task = await this.taskRepository.findOneBy({ id: id_int });
    if (!task) {
      throw new Error('Task not found');
    }
    await this.taskRepository.remove(task);
    const data_response = `Task deleted successfully with ID: ${id}`;
    return ResponseDto.successResponse(data_response, 'Thành công');
  }
  // --------------------------------------------------------------------------------------------------------------
  // update task
  // --------------------------------------------------------------------------------------------------------------
  /**
   * Update a task by its ID
   * @param id the ID of the task to update
   * @param taskDto task data
   * @returns a response with the task ID
   * @throws {Error} if the task is not found
   */
  async updateTask(id: string, updateTaskDto: updateTaskDto): Promise<ResponseDto<string>> {
    const id_int = parseInt(id);
    const task = await this.taskRepository.findOneBy({ id: id_int });
    if (!task) {
      throw new Error('Task not found');
    }
    const { name, description, time_start, time_stop } = updateTaskDto;
    task.name = name;
    task.description = description;
    task.date_start = new Date(time_start);
    task.date_stop = new Date(time_stop) ;
    await this.taskRepository.save(task);
    const data_response = `Task updated successfully with ID: ${task.id}`;
    return ResponseDto.successResponse(data_response, 'Thành công');
  }
  // --------------------------------------------------------------------------------------------------------------
  // get task by id
  // --------------------------------------------------------------------------------------------------------------
  
  /**
   * Retrieve a task by its ID
   * @param id the ID of the task to retrieve
   * @returns a response with the task if found, null otherwise
   * @throws {Error} if the task is not found
   */
  async getTaskById( id: string): Promise<any> {
    const id_int = parseInt(id);
    const task = await this.taskRepository.findOneBy({ id: id_int });
    if (!task) {
      throw new Error('Task not found');
    }
    const data_response = {
      task: task,
    }
    return ResponseDto.successResponse(data_response, 'Thành công');
  }
  // --------------------------------------------------------------------------------------------------------------
  // get type task
  // --------------------------------------------------------------------------------------------------------------
  /**
   * Retrieve all task types available in the system.
   * @returns a response with an array of task types
   * @throws {Error} if no task types are found
   */
  async getTypeTask(): Promise<any> {
    const taskType = await this.taskTypeRepository.find();
    if (!taskType) {
      throw new Error('Task not found');
    }
    const data_response = {
      taskType: taskType,
    }
    return ResponseDto.successResponse(data_response, 'Thành công');
  }
  // --------------------------------------------------------------------------------------------------------------
  //  get status task
  // --------------------------------------------------------------------------------------------------------------
  /**
   * Retrieve all task statuses available in the system.
   * @returns a response with an array of task statuses
   * @throws {Error} if no task statuses are found
   */
  async getStatusTask(): Promise<any> {
    const taskStatus = await this.taskStatusRepository.find();
    if (!taskStatus) {
      throw new Error('Task not found');
    }
    const data_response = {
      taskStatus: taskStatus, 
    }
    return ResponseDto.successResponse(data_response, 'Thành công');
  }
  // --------------------------------------------------------------------------------------------------------------
  //  get priority task
  // --------------------------------------------------------------------------------------------------------------
  /**
   * Retrieve all task priorities available in the system.
   * @returns a response with an array of task priorities
   * @throws {Error} if no task priorities are found
   */
  async getPriorityTask(): Promise<any> {
    const taskPriority = await this.taskPriorityRepository.find();
    if (!taskPriority) {
      throw new Error('Task not found');
    }
    const data_response = {
      taskPriority: taskPriority,
    }
    return ResponseDto.successResponse(data_response, 'Thành công');
  }
  // --------------------------------------------------------------------------------------------------------------
  //  get label task
  // --------------------------------------------------------------------------------------------------------------
  /**
   * Retrieve all task labels available in the system.
   * @returns a response with an array of task labels
   * @throws {Error} if no task labels are found
   */
  async getLabelTask(): Promise<any> {
    const taskLabel = await this.taskLabelRepository.find();
    if (!taskLabel) {
      throw new Error('Task not found');
    }
    const data_response = {
      taskLabel : taskLabel
    }
    return ResponseDto.successResponse(data_response, 'Thành công');
  }
}
