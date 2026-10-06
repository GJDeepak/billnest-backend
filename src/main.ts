import "dotenv/config";

import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import { HttpExceptionFilter } from "./utils/errors/http-exception.filter.js";
import { setupProcessErrorHandlers } from "./utils/errors/process-error-handler.js";

async function bootstrap() {
  setupProcessErrorHandlers();
  
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix("api/v1");

  app.useGlobalFilters(new HttpExceptionFilter());
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
    );
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
