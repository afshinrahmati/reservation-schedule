import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import 'module-alias/register';
import { GlobalHttpExceptionFilter } from '@/core/_shared/http/filters/http-exception.filter';
import { LogMiddleware } from '@/core/_shared/middlewares/log.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.use(new LogMiddleware().use);

  app.useGlobalFilters(new GlobalHttpExceptionFilter());
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Booking API')
    .setDescription('Hotel Booking System REST API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('swagger', app, document);

  const cfg = app.get(ConfigService);
  const port = cfg.get('port') ?? 3000;

  await app.listen(port);
  console.log(`Hi BLU 👋, Swagger ready at http://localhost:${port}/swagger`);
}
bootstrap();
