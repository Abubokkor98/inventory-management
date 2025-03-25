import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    try {
      return await this.authService.login(body.email, body.password);
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }
}
