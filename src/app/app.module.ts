import { AuthModule } from "@/auth/auth.module";
import configuration from "@/configuration";
import { IConfig } from "@/configuration/types";
import { LoggerModule } from "@/logger/logger.module";
import { UsersModule } from "@/users/users.module";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { AppService } from "./app.service";
import { AppController } from "./app.controller";
import { AppStatus, AppStatusSchema } from "./schemas/appStatus.schema";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.development", ".env.production"],
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<IConfig>("app").mongoUri,
      }),
    }),
    MongooseModule.forFeature([
      { name: AppStatus.name, schema: AppStatusSchema },
    ]),
    UsersModule,
    AuthModule,
    LoggerModule,
  ],
  providers: [AppService],
  controllers: [AppController],
})
export class AppModule {}
