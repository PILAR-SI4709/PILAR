import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DokumentasiService {
  constructor(private prisma: PrismaService) {}

  // Upload oleh relawan — cek dulu terdaftar di event
  async create(eventId: string, userId: string, fotoUrl: string, caption?: string) {
    const pendaftaran = await this.prisma.pendaftaran.findUnique({
      where: { userId_eventId: { userId, eventId } },
    });
    if (!pendaftaran)
      throw new BadRequestException('Kamu tidak terdaftar di event ini');

    return this.prisma.dokumentasi.create({
      data: { eventId, userId, fotoUrl, caption },
    });
  }

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

  // PBI #33 - Feyza Adyani - Hapus Foto Dokumentasi dari Galeri Admin
  async delete(id: string, userId: string) {
    const dok = await this.prisma.dokumentasi.findUnique({ where: { id } });
    if (!dok) throw new NotFoundException('Tidak ditemukan');
    if (dok.userId !== userId) throw new BadRequestException('Tidak punya akses');
    await this.prisma.dokumentasi.delete({ where: { id } });
    return { message: 'Dokumentasi dihapus' };
  }
}