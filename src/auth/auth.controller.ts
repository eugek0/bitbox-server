import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { User } from "@/users/schemas/user.schema";
import { CreateUserDto } from "./dtos/createUser.dto";
import { LoginUserDto } from "./dtos/loginUser.dto";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("register")
  async register(@Body() dto: CreateUserDto): Promise<void> {
    await this.authService.register(dto)
  }

  @Post("login")
  async login(@Body() dto: LoginUserDto): Promise<User | undefined> {
    const user = await this.authService.login(dto);
    return user;
  }
}
