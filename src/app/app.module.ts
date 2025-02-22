import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { Module } from "@nestjs/common";
import { AuthModule } from "@/auth/auth.module";
import configuration from "@/configuration";
import { IConfig } from "@/configuration/types";
import { StoragesModule } from "@/storages/storages.module";
import { LoggerModule } from "@/logger/logger.module";
import { UsersModule } from "@/users/users.module";
import { AppService } from "./app.service";

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
    UsersModule,
    AuthModule,
    LoggerModule,
    StoragesModule,
  ],
  providers: [AppService],
})
export class AppModule {}
