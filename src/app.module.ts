


import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './routes/auth.module';
import { TaskModule } from './routes/task.module';
import { DatabaseModule } from './database/connection';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './middlewares/jwt-auth.guard';
import { SeederService } from './services/seeder.service';

import { NestModule, MiddlewareConsumer } from '@nestjs/common';
import { LoggerMiddleware } from './middlewares/logger.middleware';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,   
    AuthModule,
    TaskModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    SeederService,    
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly seederService: SeederService) {}
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*');     
  }
  async onModuleInit() {
    console.log('NestJS application started and database connection is ready');
    await this.seederService.seed(); 
  }
}
