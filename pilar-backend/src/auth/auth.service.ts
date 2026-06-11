import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    // Cek email sudah terdaftar
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email sudah terdaftar');

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Simpan user baru
    const user = await this.prisma.user.create({
      data: {
        nama: dto.nama,
        email: dto.email,
        password: hashedPassword,
      },
    });

    const { password: _, ...result } = user;
    return { message: 'Registrasi berhasil', user: result };
  }

  async login(dto: LoginDto) {
    // Cek user ada
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new UnauthorizedException('Email atau password salah');

    // Cek password
    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Email atau password salah');

    // Generate JWT token
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const { password: _, ...result } = user;
    return { access_token: token, user: result };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new UnauthorizedException('User tidak ditemukan');
    const { password: _, ...result } = user;
    return result;
  }

  async oauthLogin(data: { nama: string; email: string; foto?: string; provider: string }) {
  let user = await this.prisma.user.findUnique({ where: { email: data.email } });
  if (!user) {
    user = await this.prisma.user.create({
      data: {
        nama: data.nama,
        email: data.email,
        foto: data.foto,
        password: '', // OAuth user tidak butuh password
        role: 'USER',
      },
    });
  }
  const payload = { sub: user.id, email: user.email, role: user.role };
  const { password: _, ...userWithoutPw } = user;
  return {
    access_token: this.jwtService.sign(payload),
    user: userWithoutPw,
  };
}


}