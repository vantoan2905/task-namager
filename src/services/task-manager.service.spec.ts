import { Test, TestingModule } from '@nestjs/testing';
import { TaskManagerService } from './task.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from 'src/models/task.model';
import { User } from 'src/models/user.model';
import { TaskLabel } from 'src/models/task-label.model';
import { TaskType } from 'src/models/task-type.model';
import { TaskStatus } from 'src/models/task-status.model';
import { TaskPriority } from 'src/models/task-priority.model';
import { Session } from 'src/models/session.model';
import { CreateTaskDto } from 'src/dto/task/create-task.dto';
import { updateTaskDto } from 'src/dto/task/update-task.dto';
import * as fs from 'fs';
import * as path from 'path';

describe('TaskManagerService', () => {
  let service: TaskManagerService;
  let taskRepo: jest.Mocked<Repository<Task>>;
  let userRepo: jest.Mocked<Repository<User>>;

  const mkRepo = <T>() => ({
    findOneBy: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  }) as any;

  // Mảng lưu log của tất cả test case
  const testLogs: Array<{
    name: string;
    input: any;
    output: any;
    passed: boolean;
  }> = [];

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskManagerService,
        { provide: getRepositoryToken(Task), useValue: mkRepo<Task>() },
        { provide: getRepositoryToken(User), useValue: mkRepo<User>() },
        { provide: getRepositoryToken(TaskLabel), useValue: mkRepo<TaskLabel>() },
        { provide: getRepositoryToken(TaskType), useValue: mkRepo<TaskType>() },
        { provide: getRepositoryToken(TaskStatus), useValue: mkRepo<TaskStatus>() },
        { provide: getRepositoryToken(TaskPriority), useValue: mkRepo<TaskPriority>() },
        { provide: getRepositoryToken(Session), useValue: mkRepo<Session>() },
      ],
    }).compile();

    service = module.get(TaskManagerService);
    taskRepo = module.get(getRepositoryToken(Task));
    userRepo = module.get(getRepositoryToken(User));
  });

  afterAll(() => {
    // Ghi testLogs ra file JSON sau khi chạy xong
    const outPath = path.join(__dirname, 'task-test-results.json');
    fs.writeFileSync(outPath, JSON.stringify(testLogs, null, 2), 'utf-8');
  });

  function logResult(name: string, input: any, output: any, passed: boolean) {
    testLogs.push({ name, input, output, passed });
  }

  describe('createTask', () => {
    const validDto: CreateTaskDto = {
      name: 'T1', description: 'D1',
      type_id: 1, status_id: 1, priority_id: 1, label_id: 1,
      time_start: new Date().toISOString(),
      time_stop: new Date().toISOString(),
    };

    it('missing data: username empty', async () => {
      const input = { username: '', dto: validDto };
      try {
        await service.createTask('', validDto);
        logResult('createTask_missing_username', input, null, false);
      } catch (err: any) {
        logResult('createTask_missing_username', input, err.message, true);
        expect(err).toBeDefined();
      }
    });

    it('wrong data: user not found', async () => {
      userRepo.findOneBy.mockResolvedValue(null);
      const input = { username: 'nouser', dto: validDto };
      try {
        await service.createTask('nouser', validDto);
        logResult('createTask_user_not_found', input, null, false);
      } catch (err: any) {
        logResult('createTask_user_not_found', input, err.message, true);
        expect(err.message).toBe('User not found');
      }
    });

    it('valid data: success flow', async () => {
      const user = { id: 10, username: 'u' } as User;
      const newTask = { id: 42 } as Task;
      userRepo.findOneBy.mockResolvedValue(user);
      taskRepo.create.mockReturnValue(newTask);
      taskRepo.save.mockResolvedValue(newTask);

      const input = { username: 'u', dto: validDto };
      const res = await service.createTask('u', validDto);
      logResult('createTask_success', input, res, true);

      expect(res.success).toBe(true);
      expect(res.data).toMatch(/Task created successfully with ID: 42/);
    });
  });

  describe('getAllTasks', () => {
    it('missing data: username empty', async () => {
      const input = '';
      try {
        await service.getAllTasks('');
        logResult('getAllTasks_missing_username', input, null, false);
      } catch (err: any) {
        logResult('getAllTasks_missing_username', input, err.message, true);
        expect(err).toBeDefined();
      }
    });

    it('wrong data: user not found', async () => {
      userRepo.findOneBy.mockResolvedValue(null);
      const input = 'nouser';
      try {
        await service.getAllTasks('nouser');
        logResult('getAllTasks_user_not_found', input, null, false);
      } catch (err: any) {
        logResult('getAllTasks_user_not_found', input, err.message, true);
        expect(err.message).toBe('User not found');
      }
    });

    it('valid data: returns tasks', async () => {
      const user = { id: 5 } as User;
      const tasks = [{ id: 1 }, { id: 2 }] as Task[];
      userRepo.findOneBy.mockResolvedValue(user);
      taskRepo.find.mockResolvedValue(tasks);

      const input = 'u';
      const res = await service.getAllTasks('u');
      logResult('getAllTasks_success', input, res, true);

      expect(res.success).toBe(true);
      expect(res.data.tasks).toEqual(tasks);
    });
  });

  describe('deleteTask', () => {
    it('missing data: id empty', async () => {
      const input = '';
      try {
        await service.deleteTask('');
        logResult('deleteTask_missing_id', input, null, false);
      } catch (err: any) {
        logResult('deleteTask_missing_id', input, err.message, true);
        expect(err).toBeDefined();
      }
    });

    it('wrong data: task not found', async () => {
      taskRepo.findOneBy.mockResolvedValue(null);
      const input = '99';
      try {
        await service.deleteTask('99');
        logResult('deleteTask_not_found', input, null, false);
      } catch (err: any) {
        logResult('deleteTask_not_found', input, err.message, true);
        expect(err.message).toBe('Task not found');
      }
    });

    it('valid data: delete success', async () => {
      const t = { id: 3 } as Task;
      taskRepo.findOneBy.mockResolvedValue(t);
      taskRepo.remove.mockResolvedValue(t);

      const input = '3';
      const res = await service.deleteTask('3');
      logResult('deleteTask_success', input, res, true);

      expect(res.success).toBe(true);
      expect(res.data).toContain('Task deleted successfully with ID: 3');
    });
  });

  describe('updateTask', () => {
    const dto: updateTaskDto = {
      name: 'U1', description: 'D1',
      time_start: new Date().toISOString(),
      time_stop: new Date().toISOString(),
    };

    it('missing data: id empty', async () => {
      const input = { id: '', dto };
      try {
        await service.updateTask('', dto);
        logResult('updateTask_missing_id', input, null, false);
      } catch (err: any) {
        logResult('updateTask_missing_id', input, err.message, true);
        expect(err).toBeDefined();
      }
    });

    it('wrong data: task not found', async () => {
      taskRepo.findOneBy.mockResolvedValue(null);
      const input = { id: '50', dto };
      try {
        await service.updateTask('50', dto);
        logResult('updateTask_not_found', input, null, false);
      } catch (err: any) {
        logResult('updateTask_not_found', input, err.message, true);
        expect(err.message).toBe('Task not found');
      }
    });

    it('valid data: update success', async () => {
      const t = { 
        id: 7, 
        name: '', 
        description: '', 
        date_start: null, 
        date_stop: null, 
        type: null, 
        status: null, 
        priority: null, 
        label: null, 
        assigned_user: null 
      } as unknown as Task;
      taskRepo.findOneBy.mockResolvedValue(t);
      taskRepo.save.mockResolvedValue(t);

      const input = { id: '7', dto };
      const res = await service.updateTask('7', dto);
      logResult('updateTask_success', input, res, true);

      expect(res.success).toBe(true);
      expect(res.data).toContain('Task updated successfully with ID: 7');
    });
  });

  describe('getTaskById', () => {
    it('missing data: id empty', async () => {
      const input = '';
      try {
        await service.getTaskById('');
        logResult('getTaskById_missing_id', input, null, false);
      } catch (err: any) {
        logResult('getTaskById_missing_id', input, err.message, true);
        expect(err).toBeDefined();
      }
    });

    it('wrong data: task not found', async () => {
      taskRepo.findOneBy.mockResolvedValue(null);
      const input = '123';
      try {
        await service.getTaskById('123');
        logResult('getTaskById_not_found', input, null, false);
      } catch (err: any) {
        logResult('getTaskById_not_found', input, err.message, true);
        expect(err.message).toBe('Task not found');
      }
    });

    it('valid data: get success', async () => {
      const t = { id: 8, name: 'X' } as Task;
      taskRepo.findOneBy.mockResolvedValue(t);

      const input = '8';
      const res = await service.getTaskById('8');
      logResult('getTaskById_success', input, res, true);

      expect(res.success).toBe(true);
      expect(res.data.task).toEqual(t);
    });
  });
});
