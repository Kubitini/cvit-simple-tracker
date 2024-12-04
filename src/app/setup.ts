import {
  INestApplication,
  NestApplicationOptions,
  ValidationPipe,
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const nestAppOptions: NestApplicationOptions = {
  rawBody: true,
};

export function setupApp(app: INestApplication) {
  app.useGlobalPipes(new ValidationPipe());
}

export function setupSwagger(app: INestApplication) {
  const swagger = new DocumentBuilder()
    .setTitle('Simple Tracker')
    .setDescription('The Simple Tracker API description')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, swagger);
  SwaggerModule.setup('api', app, documentFactory);
}
