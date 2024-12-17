import { Controller, Get, UseGuards } from "@nestjs/common";
import { UsersService } from "./users.service";
import { User } from "./schemas/user.schema";
import { JwtGuard } from "@/auth/jwt.guard";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("list")
  @UseGuards(JwtGuard)
  async getUsersList(): Promise<User[]> {
    return await this.usersService.getAllUsers({ password: false });
  }
}
