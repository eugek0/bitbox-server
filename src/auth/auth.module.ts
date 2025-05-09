import { forwardRef, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtStrategy } from "./jwt.strategy";
import { UsersModule } from "@/users/users.module";
import { AuthAdministratorGuard, AuthOwnerGuard } from "./guards";

@Module({
  imports: [forwardRef(() => UsersModule), JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, AuthAdministratorGuard, AuthOwnerGuard],
  exports: [JwtModule, AuthAdministratorGuard, AuthOwnerGuard],
})
export class AuthModule {}
