import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Role } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(
    @Body()
    data: {
      name: string;
      email: string;
      phone: string;
      password: string;
    },
  ) {
    return this.authService.register(
      data.name,
      data.email,
      data.phone,
      data.password,
    );
  }

  @Post('login')
  login(@Body() data: { email: string; password: string }) {
    return this.authService.login(data.email, data.password);
  }

  @Get('users')
  findAll(@Query('role') role?: Role) {
    return this.authService.findAll(role);
  }
}
