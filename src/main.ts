// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AllExceptionsFilter } from './middlewares/exception-filter';
import { ValidationPipe } from '@nestjs/common';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');
  app.useGlobalFilters( new AllExceptionsFilter());
  app.useGlobalPipes(new ValidationPipe()); 
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('The API description')
    .setVersion('1.0')
    .addTag('users')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      in: 'header',
    }, 'access-token')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document); 

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`Application is running on: http://0.0.0.0:${port}/api`);
  console.log(`Swagger is running on: http://localhost:${port}/api`);
}
bootstrap();
