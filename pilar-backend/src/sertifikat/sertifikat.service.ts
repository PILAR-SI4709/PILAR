import {
  Injectable, BadRequestException, NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SertifikatService {
  constructor(private prisma: PrismaService) {}

  // Generate nomor sertifikat unik
  private generateNomor(eventId: string): string {
    const tahun = new Date().getFullYear();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const prefix = eventId.substring(0, 4).toUpperCase();
    return `PILAR-${tahun}-${prefix}-${random}`;
  }

  // PBI #34 - Marshall Rasendria - Generate Sertifikat Otomatis Saat Pendaftaran Disetujui
  // Generate sertifikat untuk satu pendaftaran
  async generate(pendaftaranId: string, userId: string) {
    // 1. Cek pendaftaran ada dan milik user ini
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

    // 2. Cek status pendaftaran harus APPROVED
    if (pendaftaran.status !== 'APPROVED')
      throw new BadRequestException(
        'Sertifikat hanya bisa diambil jika pendaftaran sudah disetujui'
      );

    // 3. Cek event harus sudah DONE
    if (pendaftaran.event.status !== 'DONE')
      throw new BadRequestException(
        'Sertifikat baru bisa diambil setelah event selesai'
      );

    // 4. Cek sertifikat belum pernah dibuat
    const existing = await this.prisma.sertifikat.findUnique({
      where: { pendaftaranId },
    });
    if (existing) return existing; // sudah ada, return saja

    // 5. Buat sertifikat baru
    return this.prisma.sertifikat.create({
      data: {
        userId: pendaftaran.userId,
        eventId: pendaftaran.eventId,
        pendaftaranId,
        nomorSertifikat: this.generateNomor(pendaftaran.eventId),
      },
      include: {
        user: { select: { nama: true, email: true } },
        event: { select: { judul: true, tanggal: true, lokasi: true } },
      },
    });
  }

  // Ambil semua sertifikat milik user
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

  // Detail satu sertifikat berdasarkan nomor (untuk verifikasi publik)
  async getByNomor(nomorSertifikat: string) {
    const sertifikat = await this.prisma.sertifikat.findUnique({
      where: { nomorSertifikat },
      include: {
        user: { select: { nama: true, foto: true } },
        event: {
          select: {
            judul: true, tanggal: true,
            lokasi: true, gambar: true,
          },
        },
      },
    });
    if (!sertifikat)
      throw new NotFoundException('Sertifikat tidak ditemukan');
    return sertifikat;
  }

  // Detail satu sertifikat berdasarkan ID
  async getById(id: string) {
    const sertifikat = await this.prisma.sertifikat.findUnique({
      where: { id },
      include: {
        user: { select: { nama: true, foto: true, email: true } },
        event: {
          select: {
            judul: true, tanggal: true,
            lokasi: true, deskripsi: true,
          },
        },
      },
    });
    if (!sertifikat)
      throw new NotFoundException('Sertifikat tidak ditemukan');
    return sertifikat;
  }

  // Admin: lihat semua sertifikat per event
  async getByEvent(eventId: string) {
    return this.prisma.sertifikat.findMany({
      where: { eventId },
      include: {
        user: { select: { nama: true, email: true, foto: true } },
      },
      orderBy: { issuedAt: 'asc' },
    });
  }
}
