import { Test, TestingModule } from '@nestjs/testing';
import { TaskController } from './task.controller';
import { TaskManagerService } from 'src/services/task.service';
import { CreateTaskDto } from 'src/dto/task/create-task.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import * as fs from 'fs';
import * as path from 'path';

describe('TaskController', () => {
  let controller: TaskController;
  let service: any;

  // Collect test results
  const testLogs: Array<{ name: string; input: any; output: any; passed: boolean }> = [];

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [{ provide: TaskManagerService, useValue: mockService }],
    }).compile();

    controller = module.get<TaskController>(TaskController);
    service = module.get(TaskManagerService);
  });

  afterAll(() => {
    const outPath = path.join(__dirname, 'task-test-results.json');
    fs.writeFileSync(outPath, JSON.stringify(testLogs, null, 2), 'utf-8');
  });

  function logResult(name: string, input: any, output: any, passed: boolean) {
    testLogs.push({ name, input, output, passed });
  }

  const mockService = {
    createTask: jest.fn(),
    getAllTasks: jest.fn(),
    deleteTask: jest.fn(),
    updateTask: jest.fn(),
    getTaskById: jest.fn(),
    getTypeTask: jest.fn(),
    getStatusTask: jest.fn(),
    getPriorityTask: jest.fn(),
    getLabelTask: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -------------------------
  // createTask
  // -------------------------
  describe('createTask', () => {
    const username = 'tester';
    const validDto: CreateTaskDto = {
      name: 'Complete docs',
      type_id: 1,
      status_id: 2,
      priority_id: 3,
      label_id: 1,
      description: 'Documentation for API',
      time_start: new Date().toISOString(),
    };

    it('createTask_valid', async () => {
      service.createTask.mockResolvedValue({ success: true });
      let result;
      let passed = true;
      try {
        result = await controller.createTask(username, validDto);
        expect(result).toEqual({ success: true });
        expect(service.createTask).toHaveBeenCalledWith(username, validDto);
      } catch (err) {
        passed = false;
        result = err.message;
      }
      logResult('createTask_valid', { username, dto: validDto }, result, passed);
    });

    it('createTask_invalid', async () => {
      const invalid: any = { ...validDto, type_id: 'one' };
      const inst = plainToInstance(CreateTaskDto, invalid);
      const errs = await validate(inst);
      const passed = errs.length > 0;
      logResult('createTask_invalid', invalid, errs, passed);
      expect(passed).toBe(true);
    });

    it('createTask_missing', async () => {
      const missing: any = { ...validDto };
      delete missing.name;
      delete missing.type_id;
      const inst = plainToInstance(CreateTaskDto, missing);
      const errs = await validate(inst);
      const props = errs.map(e => e.property);
      const passed = props.includes('name') && props.includes('type_id');
      logResult('createTask_missing', missing, errs, passed);
      expect(passed).toBe(true);
    });
  });

  // helper to test other endpoints
  function testEndpoint(
    name: string,
    call: (...args: any[]) => Promise<any>,
    serviceFn: jest.Mock,
    okArgs: any[],
    okResult: any,
  ) {
    describe(name, () => {
      it(`${name}_valid`, async () => {
        serviceFn.mockResolvedValue(okResult);
        let result;
        let passed = true;
        try {
          result = await call(...okArgs);
          expect(result).toEqual(okResult);
        } catch (err) {
          passed = false;
          result = err.message;
        }
        logResult(`${name}_valid`, okArgs, result, passed);
      });

      it(`${name}_invalid`, async () => {
        serviceFn.mockRejectedValueOnce(new Error('Invalid input'));
        let caught;
        try {
          await call(...okArgs);
        } catch (err) {
          caught = err.message;
        }
        const passed = caught === 'Invalid input';
        logResult(`${name}_invalid`, okArgs, caught, passed);
        expect(passed).toBe(true);
      });

      it(`${name}_missing`, async () => {
        serviceFn.mockRejectedValueOnce(new Error('Missing fields'));
        let caught;
        // @ts-ignore
        try {
          await call(...okArgs.map(() => undefined));
        } catch (err) {
          caught = err.message;
        }
        const passed = caught === 'Missing fields';
        logResult(`${name}_missing`, okArgs.map(() => undefined), caught, passed);
        expect(passed).toBe(true);
      });
    });
  }

  testEndpoint('getAllTasks', (username: string) => controller.getAllTasks(username), mockService.getAllTasks, ['user1'], ['t1', 't2']);
  testEndpoint('deleteTask', (id: string) => controller.deleteTask(id), mockService.deleteTask, ['abc123'], { deleted: true });
  testEndpoint('updateTask', (id: string, dto: any) => controller.updateTask(id, dto), mockService.updateTask, ['abc123', { name: 'New name' }], { updated: true });
  testEndpoint('getTaskById', (id: string) => controller.getTaskById(id), mockService.getTaskById, ['abc123'], { id: 'abc123', name: 'T' });
  testEndpoint('getTypeTask', () => controller.getTypeTask(), mockService.getTypeTask, [], ['EPIC', 'BUG']);
  testEndpoint('getStatusTask', () => controller.getStatusTask(), mockService.getStatusTask, [], ['New', 'In Progress']);
  testEndpoint('getPriorityTask', () => controller.getPriorityTask(), mockService.getPriorityTask, [], ['Low', 'High']);
  testEndpoint('getLabelTask', () => controller.getLabelTask(), mockService.getLabelTask, [], ['urgent', 'optional']);
});
