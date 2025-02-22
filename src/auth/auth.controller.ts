import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { CreateUserDto, LoginUserDto, ProfileDto } from "./dtos";
import { JwtGuard } from "./jwt.guard";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

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
    type: CreateUserDto,
  })
  @Post("register")
  async register(
    @Body() dto: CreateUserDto,
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
}
