import { Controller, Get, Post, Patch, Body, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { SignupUserDto } from "./dto/signup-user.dto";

@ApiTags("Users")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("users")
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get("me")
  @ApiOperation({ summary: "Get current user profile" })
  getMe(@CurrentUser() user: any) {
    return this.usersService.findById(user.userId);
  }

  @Post("signup")
  @ApiOperation({ summary: "Complete user signup profile" })
  signup(
    @CurrentUser() user: any,
    @Body() dto: SignupUserDto,
  ) {
    return this.usersService.signup(user.userId, dto);
  }

  @Patch("me")
  @ApiOperation({ summary: "Update user profile" })
  updateProfile(
    @CurrentUser() user: any,
    @Body() dto: Partial<SignupUserDto>,
  ) {
    return this.usersService.updateProfile(user.userId, dto);
  }
}
