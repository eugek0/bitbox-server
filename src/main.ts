import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { IConfig } from "./configuration/types";
import { ValidationPipe } from "@nestjs/common";
import * as cookieParser from "cookie-parser";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const { port } = app.get(ConfigService).get<IConfig>("app");

  app.use(cookieParser());
  app.enableCors({
    credentials: true,
    origin: "http://localhost:3000",
  });

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(port);
  console.log(`Server is running on port ${port}`);
}
bootstrap();
