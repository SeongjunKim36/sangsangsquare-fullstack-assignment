import { NestFactory } from "@nestjs/core";
import { AppModule } from "./modules/app.module";
import { ConfigService } from "@nestjs/config";
import { NestExpressApplication } from "@nestjs/platform-express";
import { middleware } from "./modules/app.middleware";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get<ConfigService>(ConfigService);
  const PORT = configService.get<number>("PORT", 4000);

  // ValidationPipe 전역 적용
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  middleware(app);
  await app.listen(PORT, "0.0.0.0");
  console.log(`http://localhost:${PORT}/api`);
}
void bootstrap();
