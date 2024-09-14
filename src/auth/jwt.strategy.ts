import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { IConfig } from "@/configuration/types";
import { Request } from "express";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtStrategy.extractFromCookies,
      ]),

      ignoreExpiration: false,
      secretOrKey: configService.get<IConfig>("app").accessSecret,
    });
  }

  async validate(payload: any): Promise<string> {
    return payload.sub;
  }

  // INFO: Приватные методы

  private static extractFromCookies(request: Request): string | undefined {
    return request?.cookies?.access;
  }
}
