 import {
  Injectable, BadRequestException, NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SertifikatService {
  constructor(private prisma: PrismaService) {}

  private generateNomor(eventId: string): string {
    const tahun = new Date().getFullYear();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const prefix = eventId.substring(0, 4).toUpperCase();
    return `PILAR-${tahun}-${prefix}-${random}`;
  }
 // PBI #29 - Syifa Rizani - Generate dan Unduh Sertifikat PDF
  async generate(pendaftaranId: string, userId: string) {
    const pendaftaran = await this.prisma.pendaftaran.findUnique({
      where: { id: pendaftaranId },
      include: {
        event: true,
        user: { select: { id: true, nama: true, email: true } },
      },
    });

    if (!pendaftaran)
      throw new NotFoundException('Pendaftaran tidak ditemukan');

    if (pendaftaran.userId !== userId)
      throw new BadRequestException('Tidak punya akses ke pendaftaran ini');

 // PBI #28 - Syifa Rizani - Daftar Sertifikat Relawan
  async getMySertifikat(userId: string) {
    return this.prisma.sertifikat.findMany({
      where: { userId },
      include: {
        event: {
          select: {
            id: true, judul: true,
            tanggal: true, lokasi: true, gambar: true,
          },
        },
      },
      orderBy: { issuedAt: 'desc' },
    });
  }