import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from '../models/task.model';
import { TaskType } from '../models/task-type.model';
import { TaskStatus } from '../models/task-status.model';
import { TaskPriority } from '../models/task-priority.model';
import { TaskLabel } from '../models/task-label.model';
import { Session } from 'src/models/session.model';
import { User } from 'src/models/user.model';
import { TaskController } from '../controllers/task.controller';
import { TaskManagerService } from '../services/task.service';
import { SessionRepository } from 'src/repositories/session.repository';
import { AuthModule } from './auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Task,
      TaskType,
      TaskStatus,
      TaskPriority,
      TaskLabel,
      Session,
      User,
      SessionRepository,
    ]),
    forwardRef(() => AuthModule),  
  ],
  controllers: [TaskController],
  providers: [TaskManagerService],
  exports: [TaskManagerService],
})
export class TaskModule {}
