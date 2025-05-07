// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AllExceptionsFilter } from './middlewares/exception-filter';
import { ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from './middlewares/response.interceptor';
/**
 * Initializes and bootstraps the NestJS application.
 * 
 * - Creates an instance of the application using the `AppModule`.
 * - Enables CORS for all origins and common HTTP methods.
 * - Sets a global prefix for all routes to `api/v1`.
 * - Applies a global response interceptor and exception filter.
 * - Uses a global validation pipe to automatically validate incoming requests.
 * - Configures Swagger for API documentation with JWT bearer authentication.
 * - Starts the application, listening on the specified port (default: 3000).
 * - Logs the URLs for accessing the application and Swagger documentation.
 */

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    // origin: 'http://192.168.72.1:8000',
    origin:"*",
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    // credentials: true,
  });

  app.setGlobalPrefix('api/v1');
  app.useGlobalInterceptors(new ResponseInterceptor());
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
