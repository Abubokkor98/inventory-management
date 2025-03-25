const bcrypt = require('bcrypt');

import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from 'src/database/database.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private databaseService: DatabaseService,
    private jwtService: JwtService,
  ) {}

  // Registration method
  async register(registerDto: RegisterDto) {
    const { name, email, phone, password } = registerDto;

    try {
      // Hash the password before storing it in the database
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user in the database
      const user = await this.databaseService.user.create({
        data: {
          name,
          email,
          phone,
          password: hashedPassword,
          role: 'ADMIN',
        },
      });

      // Return user data (optional)
      return {
        id: user.id,
        email: user.email,
        role: user.role,
      };
    } catch (error) {
      // Handle duplicate email/phone errors
      if (error.code === 'P2002') {
        throw new ConflictException('Email or phone already exists');
      }
      throw error;
    }
  }

  async login(email: string, password: string) {
    // find user by email
    const user = await this.databaseService.user.findUnique({
      where: { email },
    });
    // console.log('User from DB:', user);

    // Check if user exists and password is correct
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload = { sub: user.id, email: user.email, role: user.role };
    // sign the payload and return the token
    return { access_token: this.jwtService.sign(payload) };
  }
}
