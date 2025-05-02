import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { IConfig } from "@/configuration";
import { Request } from "express";
import { UsersService } from "@/users";
import * as bcrypt from "bcryptjs";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([JwtStrategy.extractToken]),

      ignoreExpiration: false,
      secretOrKey: configService.get<IConfig>("app").accessSecret,
    });
  }

  async validate(payload: any): Promise<string> {
    const questioner = await this.usersService.getById(payload.sub);

    if (
      payload.type === "pubapi" &&
      (!questioner.developerToken ||
        !bcrypt.compare(payload.dev, questioner.developerToken))
    ) {
      throw new UnauthorizedException();
    }

    return payload.sub;
  }

  // INFO: Приватные методы

  private static extractToken(request: Request): string | undefined {
    return (
      request.headers.Authorization?.toString().split(" ")[1] ??
      request.headers.authorization?.toString().split(" ")[1] ??
      request?.cookies?.access
    );
  }
}
