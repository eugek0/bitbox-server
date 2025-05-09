import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import bcrypt from "bcryptjs";
import { IConfig } from "@/configuration/types";
import { UsersService, User } from "@/users";
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { FormException, genRandomString, isHttpException } from "@/core";
import { LoginUserDto, ProfileDto, RegisterUserDto } from "./dtos";
import { ITokenPayload, ITokens } from "./types";

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
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

    const { password, developerToken, ...profile } = user;

    return profile;
  }

  async generateRecoverToken(email: string): Promise<string> {
    const token = genRandomString();

    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(token, salt);

    const { _id } = await this.usersService.getByEmail(email);
    await this.usersService.setRecoveryToken(_id.toString(), hash);

    return token;
  }

  async generateDeveloperToken(userid: string): Promise<string> {
    const { accessSecret } = this.configService.get<IConfig>("app");
    const user = await this.usersService.getById(userid);

    if (!user) {
      throw new NotFoundException("Пользователя с таким ID не существует");
    }

    const dev = genRandomString();

    const token = await this.jwtService.signAsync(
      {
        sub: userid,
        role: user.role,
        type: "pubapi",
        dev,
      },
      { secret: accessSecret },
    );

    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(dev, salt);
    await this.usersService.setDeveloperToken(userid, hash);

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
        { sub: _id, type: "user", role },
        {
          secret: accessSecret,
          expiresIn: accessExpires,
        },
      ),
      refresh: await this.jwtService.signAsync(
        { sub: _id, type: "user", role },
        {
          secret: refreshSecret,
          expiresIn: refreshExpires,
        },
      ),
    };
  }
}
