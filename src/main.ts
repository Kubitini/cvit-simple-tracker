import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from './app/app.config';
import { nameof } from 'ts-simple-nameof';
import { nestAppOptions, setupApp, setupSwagger } from './app/setup';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    nestAppOptions,
  );
  setupApp(app);
  setupSwagger(app);

  const config = app.get<ConfigService<AppConfig, true>>(ConfigService);
  const port = config.get<number>(
    nameof<AppConfig>((p) => p.port), // REVIEW: Proč nepoužít obyčejný string?
    { infer: true },
  );
  await app.listen(port);
}

bootstrap();
