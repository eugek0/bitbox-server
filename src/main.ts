import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import * as cookieParser from "cookie-parser";
import { AppModule } from "./app.module";
import { IConfig } from "./configuration/types";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const { port, origin } = app.get(ConfigService).get<IConfig>("app");

  app.use(cookieParser());
  app.enableCors({
    credentials: true,
    origin,
  });

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(port);
  console.log(`Server is running on port ${port}`);
}
bootstrap();
