import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { envVars } from './config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  app.enableCors();

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Participación Ciudadana API')
    .setDescription('API para el sistema de participación ciudadana')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT', description: 'JWT token for authentication' })
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-doc', app, documentFactory);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      forbidUnknownValues: true,
    }),
  );
  await app.listen(envVars.PORT);
  Logger.log(`Server is running on port ${envVars.PORT}`, 'NestApplication');
  Logger.log(`API documentation is running on port ${envVars.PORT}/api-doc`, 'NestApplication');
  Logger.warn(`NODE ENVIRONMENT: ${envVars.NODE_ENV}`, 'NestApplication');
}
void bootstrap();
