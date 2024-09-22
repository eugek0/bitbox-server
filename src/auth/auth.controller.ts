import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateUserDto } from "./dtos/createUser.dto";
import { LoginUserDto } from "./dtos/loginUser.dto";
import { Request, Response } from "express";
import { ProfileType } from "./types";
import { JwtGuard } from "./jwt.guard";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("register")
  async register(
    @Body() dto: CreateUserDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const { access, refresh } = await this.authService.register(dto);
    response.cookie("access", access, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });
    response.cookie("refresh", refresh, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });
  }

  @Post("login")
  async login(
    @Body() dto: LoginUserDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const { access, refresh } = await this.authService.login(dto);
    response.cookie("access", access, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });
    response.cookie("refresh", refresh, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });
  }

  @Get("logout")
  async logout(@Res({ passthrough: true }) response: Response): Promise<void> {
    response.cookie("access", "", {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });
    response.cookie("refresh", "", {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });
  }

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
      sameSite: "none",
      secure: true,
    });
    response.cookie("refresh", refresh, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });
  }

  @UseGuards(JwtGuard)
  @Get("profile")
  async profile(@Req() request: Request): Promise<ProfileType> {
    return await this.authService.profile(request.user as string);
  }
}
