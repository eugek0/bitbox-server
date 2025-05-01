import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { IConfig } from "@/configuration/types";
import { UsersService, User } from "@/users";
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { FormException, isHttpException } from "@/core";
import { LoginUserDto, ProfileDto, RegisterUserDto } from "./dtos";
import { ITokenPayload, ITokens } from "./types";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterUserDto): Promise<ITokens> {
    try {
      const user = await this.usersService.create(dto);
      return this.generateTokens(user);
    } catch (error) {
      if (isHttpException(error)) {
        throw new FormException(error.message, error.cause as string);
      }
    }
  }

  async login(dto: LoginUserDto): Promise<ITokens> {
    const user = await this.validate(dto);
    return this.generateTokens(user);
  }

  async adminLogin(dto: LoginUserDto): Promise<ITokens> {
    const user = await this.validate(dto);
    return this.generateTokens(user);
  }

  async refresh(oldRefresh: string): Promise<ITokens> {
    const { refreshSecret } = this.configService.get<IConfig>("app");
    try {
      const { sub } = this.jwtService.verify<ITokenPayload>(oldRefresh, {
        secret: refreshSecret,
      });

      const user = await this.usersService.getById(sub);

      if (!user) {
        throw new BadRequestException("Пользователя с таким ID не существует");
      }

      return await this.generateTokens(user);
    } catch {
      throw new UnauthorizedException();
    }
  }

  async profile(id: string): Promise<ProfileDto> {
    const user = await this.usersService.getById(id);

    if (!user) {
      throw new BadRequestException("Такого пользователя не существует");
    }

    const { password, ...profile } = user;

    return profile;
  }

  async generateRecoverToken(email: string): Promise<string> {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let token = "";
    for (let i = 0; i < 8; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(token, salt);

    const { _id } = await this.usersService.getByEmail(email);
    await this.usersService.setRecoveryToken(_id.toString(), hash);

    return token;
  }

  // INFO: Приватные методы

  private async validate(dto: LoginUserDto): Promise<User> {
    const user = await this.usersService.getByEmail(dto.email);

    if (!user) {
      throw new FormException(
        "Пользователя с таким Email не существует",
        "email",
      );
    }
    if (!(await bcrypt.compare(dto.password, user.password))) {
      throw new FormException("Неправильный пароль", "password");
    }

    return user;
  }

  private async generateTokens(payload: User): Promise<ITokens> {
    const { _id, role, ..._ } = payload;
    const { accessSecret, accessExpires, refreshSecret, refreshExpires } =
      this.configService.get<IConfig>("app");

    return {
      access: await this.jwtService.signAsync(
        { sub: _id, role },
        {
          secret: accessSecret,
          expiresIn: accessExpires,
        },
      ),
      refresh: await this.jwtService.signAsync(
        { sub: _id, role },
        {
          secret: refreshSecret,
          expiresIn: refreshExpires,
        },
      ),
    };
  }
}
