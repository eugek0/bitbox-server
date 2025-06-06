import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { LoggerService } from "./logger.service";
import { JwtService } from "@nestjs/jwt";
import moment from "moment";
import { ConfigService } from "@nestjs/config";
import { IConfig } from "@/configuration";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(
    private readonly loggerService: LoggerService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async use(request: Request, _: Response, next: NextFunction) {
    const excludedRoutes = ["/auth", "/logger", "/users/password"];
    const excludedMethods = ["GET"];

    if (
      excludedRoutes.some((path) => request.originalUrl.startsWith(path)) ||
      excludedMethods.some((method) => method === request.method)
    ) {
      return next();
    }

    const { method, baseUrl, ip, headers, query, body, cookies } = request;

    const token =
      (headers["authorization"] as string)?.split(" ")[1] ??
      (headers["Authorization"] as string)?.split(" ")[1] ??
      cookies.access;

    try {
      const { accessSecret } = this.configService.get<IConfig>("app");

      const { sub, type } = token
        ? await this.jwtService.verifyAsync(token, { secret: accessSecret })
        : {};

      this.loggerService.create({
        user: sub,
        method,
        createdAt: moment().toDate(),
        url: baseUrl,
        ip,
        type,
        body,
        userAgent: headers["user-agent"],
        query,
      });
    } catch {}

    next();
  }
}
