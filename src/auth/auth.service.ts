import { IConfig } from "@/configuration/types";
import { User } from "@/users/schemas/user.schema";
import { UsersService } from "@/users/users.service";
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { CreateUserDto } from "./dtos/createUser.dto";
import { LoginUserDto } from "./dtos/loginUser.dto";
import { ITokenPayload, ITokens, ProfileType } from "./types";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  async register(dto: CreateUserDto): Promise<ITokens> {
    const user = await this.usersService.create(dto);

    return this.generateTokens(user);
  }

  async login(dto: LoginUserDto): Promise<ITokens> {
    const user = await this.usersService.getByEmail(dto.email);

    if (!user) {
      throw new BadRequestException("Пользователя с таким Email не существует");
    }

    if (user.password !== dto.password) {
      throw new BadRequestException("Неправильный пароль");
    }

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

  async getProfile(id: string): Promise<ProfileType> {
    const user = await this.usersService.getById(id);

    if (!user) {
      throw new BadRequestException("Такого пользователя не существует");
    }

    const { password, ...profile } = user;

    return profile;
  }

  // INFO: Приватные методы

  private async generateTokens(payload: User): Promise<ITokens> {
    const { _id, ..._ } = payload;
    const { accessSecret, accessExpires, refreshSecret, refreshExpires } =
      this.configService.get<IConfig>("app");

    return {
      access: await this.jwtService.signAsync(
        { sub: _id },
        {
          secret: accessSecret,
          expiresIn: accessExpires,
        },
      ),
      refresh: await this.jwtService.signAsync(
        { sub: _id },
        {
          secret: refreshSecret,
          expiresIn: refreshExpires,
        },
      ),
    };
  }
}
