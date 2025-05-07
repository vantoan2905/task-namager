// src/database/database.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../models/user.model';
import { VerificationCode } from '../models/verification-code.model';
import { Session } from '../models/session.model';
import { Task } from '../models/task.model';
import { TaskType } from '../models/task-type.model';
import { TaskStatus } from '../models/task-status.model';
import { TaskPriority } from '../models/task-priority.model';
import { TaskLabel } from '../models/task-label.model';
import { Comment } from '../models/comment.model';
const ENTITIES = [
  User,
  VerificationCode,
  Session,
  Task,
  TaskType,
  TaskStatus,
  TaskPriority,
  TaskLabel,
  Comment,
];

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mariadb',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        entities: ENTITIES,
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature(ENTITIES),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
