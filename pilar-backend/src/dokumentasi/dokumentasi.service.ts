import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DokumentasiService {
  constructor(private prisma: PrismaService) {}

  // PBI #32 - Feyza Adyani - Upload Foto Dokumentasi Kegiatan oleh Admin
  // Upload oleh admin — tidak perlu cek pendaftaran
  async createAdmin(eventId: string, userId: string, fotoUrl: string, caption?: string) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event tidak ditemukan');
    return this.prisma.dokumentasi.create({
      data: { eventId, userId, fotoUrl, caption },
    });
  }

  async getByEvent(eventId: string) {
    return this.prisma.dokumentasi.findMany({
      where: { eventId },
      include: { user: { select: { id: true, nama: true, foto: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}