// Tambahkan BadRequestException pada import
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import * as bcrypt from 'bcryptjs'; 

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: { select: { pendaftaran: true, sertifikat: true } },
      },
    });
    if (!user) throw new NotFoundException('User tidak ditemukan');
    const { password: _, ...result } = user;
    return result;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
    });
    const { password: _, ...result } = user;
    return result;
  }

  async getStats(userId: string) {
    const approved = await this.prisma.pendaftaran.findMany({
      where: { userId, status: 'APPROVED' },
      include: { event: { include: { sampah: true } } },
    });
    const totalSampah = approved.reduce((sum, p) =>
      sum + p.event.sampah.reduce((s, sp) => s + sp.jumlahKg, 0), 0
    );
    return {
      totalEvent: approved.length,
      totalSampahKg: totalSampah,
    };
  }

  // --- TAMBAHAN BARU: Logika Ganti Password ---
  async changePassword(userId: string, passwordLama: string, passwordBaru: string) {
    // 1. Cari user di database
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('User tidak ditemukan');

    // 2. Cek apakah password lama cocok dengan yang ada di database
    const isPasswordValid = await bcrypt.compare(passwordLama, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Password lama salah');
    }

    // 3. Hash password baru
    const hashedPassword = await bcrypt.hash(passwordBaru, 10);

    // 4. Update password di database
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password berhasil diubah' };
  }
  // --------------------------------------------
}