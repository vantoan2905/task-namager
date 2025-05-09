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
import { Comment } from 'src/models/comment.model';
import { CommentController } from 'src/controllers/comment.controller';
import { CommentService } from 'src/services/comment.service';


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
      Comment
    ]),
    forwardRef(() => AuthModule),  
  ],
  controllers: [TaskController, CommentController],
  providers: [TaskManagerService, CommentService],
  exports: [TaskManagerService],
})
export class TaskModule {}
