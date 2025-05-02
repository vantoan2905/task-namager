
import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { AuthModule } from './routes/auth.module';
import { TaskModule } from './routes/task.module';
import { User } from './models/user.model';
import { VerificationCode } from './models/verification-code.model';
import { Session } from './models/session.model';
import { Task } from './models/task.model';
import { TaskType } from './models/task-type.model';
import { TaskStatus } from './models/task-status.model';
import { TaskPriority } from './models/task-priority.model';
import { TaskLabel } from './models/task-label.model';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './middlewares/jwt-auth.guard';
import { SeederService } from './services/seeder.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mariadb',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [
          User, 
          VerificationCode, 
          Session, 
          Task, 
          TaskType, 
          TaskStatus, 
          TaskPriority, 
          TaskLabel],
        synchronize: true,
      }),
    }),
    AuthModule,
    TaskModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule implements OnModuleInit {
  constructor(
    // private readonly dataSource: DataSource,
    // private readonly seederService: SeederService,
  ) {}

  onModuleInit() {
    console.log('NestJS application started and database connection is ready');
    // this.seederService.seed();
  }
}