import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
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

    response.cookie("access", access, { httpOnly: true });
    response.cookie("refresh", refresh, { httpOnly: true });
  }

  @Post("login")
  async login(
    @Body() dto: LoginUserDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const { access, refresh } = await this.authService.login(dto);

    response.cookie("access", access, { httpOnly: true });
    response.cookie("refresh", refresh, { httpOnly: true });
  }

  @UseGuards(JwtGuard)
  @Get("profile")
  async profile(@Req() request: Request): Promise<ProfileType> {
    return await this.authService.getProfile(request.user as string);
  }
}
