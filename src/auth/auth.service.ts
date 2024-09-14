import { UsersService } from "@/users/users.service";
import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateUserDto } from "./dtos/createUser.dto";
import { LoginUserDto } from "./dtos/loginUser.dto";
import { User } from "@/users/schemas/user.schema";
import { ConfigService } from "@nestjs/config";
import { IConfig } from "@/configuration/types";
import { JwtService } from "@nestjs/jwt";
import { ITokens } from "./types";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  async register(dto: CreateUserDto): Promise<void> {
    await this.usersService.create(dto);
  }

  async login(dto: LoginUserDto): Promise<User | undefined> {
    const user = await this.usersService.getByEmail(dto.email);

    if (!user) {
      throw new BadRequestException("Пользователя с таким Email не существует");
    }

    if (user.password !== dto.password) {
      throw new BadRequestException("Неправильный пароль");
    }

    return user;
  }
}
