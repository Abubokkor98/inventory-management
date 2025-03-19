import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from 'src/database/database.service';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private databaseService: DatabaseService,
    private jwtService: JwtService,
  ) {}

  async register(name: string, email: string, phone: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    return this.databaseService.user.create({
      data: { name, email, phone, password: hashedPassword },
    });
  }

  async login(email: string, password: string) {
    const user = await this.databaseService.user.findUnique({
      where: { email },
    });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error('Invalid credentials');
    }
    return { token: this.jwtService.sign({ id: user.id, role: user.role }) };
  }

  async findAll(role?: Role) {
    if (role)
      return this.databaseService.user.findMany({
        where: {
          role,
        },
      });
    return this.databaseService.user.findMany();
  }
}
