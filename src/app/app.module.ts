import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { MiddlewareConsumer, Module } from "@nestjs/common";
import { configuration, IConfig } from "@/configuration";
import { StoragesModule } from "@/storages";
import { LoggerModule } from "@/logger";
import { UsersModule } from "@/users";
import { AuthModule } from "@/auth";
import { AppService } from "./app.service";
import { EntitiesModule } from "@/entities";
import { MailerModule } from "@nestjs-modules/mailer";
import { PugAdapter } from "@nestjs-modules/mailer/dist/adapters/pug.adapter";
import { LoggerMiddleware } from "@/logger/logger.middleware";

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
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const { mailerUser, mailerPassword, mailerHost, mailerSignature } =
          configService.get<IConfig>("app");

        return {
          transport: `smtps://${mailerUser}:${mailerPassword}@${mailerHost}`,
          defaults: {
            from: `${mailerSignature} ${mailerUser}`,
          },
          template: {
            adapter: new PugAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
    }),
    AuthModule,
    UsersModule,
    LoggerModule,
    StoragesModule,
    EntitiesModule,
  ],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes("*");
  }
}
