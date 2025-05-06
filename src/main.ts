import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as cookieParser from "cookie-parser";
import * as fsp from "fs/promises";
import { IConfig } from "./configuration";
import { UsersService } from "./users";
import { APP_VERSION } from "./core";
import { AppModule } from "./app";
import { LoggerService } from "./logger";
import { METHODS_SEED } from "./seeds";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const userService = app.get(UsersService);
  const loggerService = app.get(LoggerService);
  const configService = app.get(ConfigService);

  const { port, origin, adminLogin, adminEmail, adminPassword } =
    configService.get<IConfig>("app");

  app.use(cookieParser());
  app.enableCors({
    credentials: true,
    origin: origin.split(","),
  });

  app.useGlobalPipes(new ValidationPipe());

  const documentConfig = new DocumentBuilder()
    .setTitle("Документация к BitBox API")
    .setDescription('Документация к API облачного хранилища файлов "BitBox"')
    .setVersion(APP_VERSION)
    .setContact("Eugene", "https://t.me/eugek0", "palma21042005@gmail.com")
    .addTag(
      "Профиль",
      "Методы для работы с профилем, а также методы для аутентификации.",
    )
    .addTag("Пользователи", "Методы для работы с пользователями.")
    .addTag("Хранилища", "Методы для работы с хранилищами.")
    .build();

  // INFO: Создание стандартного пользователя администратора
  if (
    adminPassword &&
    adminEmail &&
    !(await userService.getByEmail(adminEmail))
  ) {
    userService.create({
      login: adminLogin ?? "owner",
      email: adminEmail,
      password: adminPassword,
      isCreator: true,
      role: "owner",
    });
  }

  await fsp.mkdir("temp", { recursive: true });
  await fsp.mkdir("storages", { recursive: true });

  const methods = await loggerService.methodsCount();

  if (methods === 0) {
    await loggerService.seedMethodsDescriptions(METHODS_SEED);
  }

  const document = SwaggerModule.createDocument(app, documentConfig);
  SwaggerModule.setup("api", app, document);

  await app.listen(port);
  console.log(`Server is running on port ${port}`);
}
bootstrap();
