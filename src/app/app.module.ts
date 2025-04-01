import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { Module } from "@nestjs/common";
import { configuration, IConfig } from "@/configuration";
import { StoragesModule } from "@/storages";
import { LoggerModule } from "@/logger";
import { UsersModule } from "@/users";
import { AuthModule } from "@/auth";
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
    AuthModule,
    UsersModule,
    LoggerModule,
    StoragesModule,
  ],
  providers: [AppService],
})
export class AppModule {}
