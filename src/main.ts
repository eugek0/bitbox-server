import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { IConfig } from "./configuration/types";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const { port } = app.get(ConfigService).get<IConfig>("app");

  await app.listen(port);
  console.log(`Server is running on port ${port}`);
}
bootstrap();
