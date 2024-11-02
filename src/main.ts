import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as cookieParser from "cookie-parser";
import { AppModule } from "./app.module";
import { IConfig } from "./configuration/types";
import { APP_VERSION } from "./core/types/constants";
import { LoggerFilter } from "./logger/logger.filter";
import { LoggerService } from "./logger/logger.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const { port, origin } = app.get(ConfigService).get<IConfig>("app");
  const loggerService = app.get(LoggerService);

  app.use(cookieParser());
  app.enableCors({
    credentials: true,
    origin,
  });

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new LoggerFilter(loggerService));

  const documentConfig = new DocumentBuilder()
    .setTitle("Документация к Stash API")
    .setDescription('Документация к API облачного хранилища файлов "Stash"')
    .setVersion(APP_VERSION)
    .setContact("Eugene", "https://t.me/eugek0", "palma21042005@gmail.com")
    .addTag(
      "Пользователи",
      "Методы для работы с пользователями, а также методы для аутентификации.",
    )
    .build();

  const document = SwaggerModule.createDocument(app, documentConfig);
  SwaggerModule.setup("api", app, document);

  await app.listen(port);
  console.log(`Server is running on port ${port}`);
}
bootstrap();
