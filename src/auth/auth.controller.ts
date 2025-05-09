import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  forwardRef,
  Get,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import {
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { INotification, TrimStringsPipe, User } from "@/core";
import { JwtGuard } from "./jwt.guard";
import { RegisterUserDto, LoginUserDto, ProfileDto } from "./dtos";
import { MailerService } from "@nestjs-modules/mailer";
import { ConfigService } from "@nestjs/config";
import { IConfig } from "@/configuration";
import { UsersService } from "@/users";
import bcrypt from "bcryptjs";
import { RecoverPasswordDto } from "./dtos/recover.dto";
import moment from "moment";
import { getRecoverHTML } from "./utils";

@Controller("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private mailerService: MailerService,
    private configService: ConfigService,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
  ) {}

  @ApiTags("Профиль")
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Пользователь зарегистрирован.",
    headers: {
      "Set-Cookie": {
        description: "Токен доступа и токен обновления.",
        required: true,
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Ошибка пользовательского ввода.",
  })
  @ApiBody({
    description: "Данные для регистрации пользователя.",
    type: RegisterUserDto,
  })
  @UsePipes(TrimStringsPipe)
  @Post("register")
  async register(
    @Body() dto: RegisterUserDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const { access, refresh } = await this.authService.register(dto);
    response.cookie("access", access, {
      httpOnly: true,
    });
    response.cookie("refresh", refresh, {
      httpOnly: true,
    });
  }

  @ApiTags("Профиль")
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Пользователь авторизован.",
    headers: {
      "Set-Cookie": {
        description: "Токен доступа и токен обновления.",
        required: true,
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Ошибка пользовательского ввода.",
  })
  @ApiBody({
    description: "Данные, подтверждающие аутентичность пользователя.",
    type: LoginUserDto,
  })
  @UsePipes(TrimStringsPipe)
  @Post("login")
  async login(
    @Body() dto: LoginUserDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const { access, refresh } = await this.authService.login(dto);
    response.cookie("access", access, {
      httpOnly: true,
    });
    response.cookie("refresh", refresh, {
      httpOnly: true,
    });
  }

  @ApiTags("Профиль")
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Токены очищены.",
    headers: {
      "Set-Cookie": {
        description: "Пустые JWT токены.",
        required: true,
      },
    },
  })
  @Get("logout")
  async logout(@Res({ passthrough: true }) response: Response): Promise<void> {
    response.cookie("access", "", {
      httpOnly: true,
    });
    response.cookie("refresh", "", {
      httpOnly: true,
    });
  }

  @ApiTags("Профиль")
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Токены обновлены.",
    headers: {
      "Set-Cookie": {
        description: "Токен доступа и токен обновления.",
        required: true,
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "Невалидный токен доступа (мертв или подменен).",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "В токене записаны неверные/неактуальные данные.",
  })
  @Get("refresh")
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const oldRefresh = request.cookies.refresh;

    if (!oldRefresh) {
      throw new UnauthorizedException();
    }

    const { access, refresh } = await this.authService.refresh(oldRefresh);
    response.cookie("access", access, {
      httpOnly: true,
    });
    response.cookie("refresh", refresh, {
      httpOnly: true,
    });
  }

  @ApiTags("Профиль")
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Данные профиля получены.",
    type: ProfileDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: "Невалидный токен доступа (мертв или подменен).",
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Переданы невалидные/неактуальные данные.",
  })
  @UseGuards(JwtGuard)
  @Get("profile")
  async profile(@Req() request: Request): Promise<ProfileDto> {
    return await this.authService.profile(request.user as string);
  }

  @ApiTags("Профиль")
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Отправлено письмо для восстановления пароля.",
  })
  @ApiQuery({
    name: "email",
    description: "Адрес электронной почты",
  })
  @Get("send_recovery_letter")
  async sendRecoveryLetter(@Query("email") email: string): Promise<void> {
    const { mailerUser, frontendUrl } = this.configService.get<IConfig>("app");

    const user = await this.usersService.getByEmail(email);

    if (!user) {
      return;
    }

    const token = await this.authService.generateRecoverToken(email);

    const href = `${frontendUrl}/auth/recover/${user._id.toString()}?token=${token}`;

    await this.mailerService.sendMail({
      to: email,
      from: mailerUser,
      subject: "Восстановление пароля",
      html: getRecoverHTML(href, user.name ?? user.login),
    });
  }

  @ApiTags("Профиль")
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Токен является действительным",
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: "Токен является недействительным",
  })
  @ApiQuery({
    name: "token",
    description: "Токен восстановления",
  })
  @ApiParam({
    name: "userid",
    description: "ID пользователя",
  })
  @Get("check_recovery_token/:userid")
  async checkToken(
    @Param("userid") userid: string,
    @Query("token") token: string,
  ): Promise<void> {
    const user = await this.usersService.getById(userid);

    if (
      !user?.recoveryToken ||
      !bcrypt.compare(token, user.recoveryToken) ||
      moment().isAfter(moment(user.recoveryTokenDeath))
    ) {
      throw new ForbiddenException("Токен является недействительным");
    }
  }

  @ApiTags("Профиль")
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Пароль восстановлен.",
  })
  @ApiParam({
    name: "userid",
    description: "ID пользователя",
  })
  @ApiQuery({
    name: "token",
    description: "Токен восстановления",
  })
  @Patch("recover/:userid")
  async recover(
    @Param("userid") userid: string,
    @Query("token") token: string,
    @Body() { password }: RecoverPasswordDto,
  ): Promise<INotification> {
    const user = await this.usersService.getById(userid);

    if (!bcrypt.compare(token, user.recoveryToken)) {
      throw new ForbiddenException("Неверный токен восстановления");
    }

    if (moment().isAfter(moment(user.recoveryTokenDeath))) {
      throw new BadRequestException("Истек срок жизни токена восстановления");
    }

    await this.usersService.recoverPassword(userid, password);

    return {
      notification: {
        status: "success",
        config: {
          message: "Успех",
          description: "Пароль успешно изменен",
        },
      },
    };
  }

  @ApiTags("Профиль")
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Токен разработчика сгенерирован",
  })
  @UseGuards(JwtGuard)
  @Post("dev_token")
  async generateDeveloperToken(@User() userid: string): Promise<string> {
    return this.authService.generateDeveloperToken(userid);
  }

  @ApiTags("Профиль")
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Токен разработчика удален",
  })
  @UseGuards(JwtGuard)
  @Delete("dev_token")
  async deleteDevelopmentToken(@User() userid: string): Promise<void> {
    await this.usersService.setDeveloperToken(userid, null);
  }

  @ApiTags("Профиль")
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      "Возвращен флаг присутствия у пользователя токена разработчика",
  })
  @UseGuards(JwtGuard)
  @Get("dev_token")
  async checkDeveloperToken(@User() userid: string): Promise<boolean> {
    const user = await this.usersService.getById(userid);

    return !!user.developerToken;
  }
}
