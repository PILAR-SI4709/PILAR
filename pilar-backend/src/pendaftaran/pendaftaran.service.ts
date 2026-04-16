import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePendaftaranDto } from './dto/create-pendaftaran.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@Injectable()
export class PendaftaranService {
  constructor(private prisma: PrismaService) {}

  async daftar(dto: CreatePendaftaranDto, userId: string) {
    // 1. Cek event ada
    const event = await this.prisma.event.findUnique({
      where: { id: dto.eventId },
      include: { _count: { select: { pendaftaran: true } } },
    });
    if (!event) throw new NotFoundException('Event tidak ditemukan');

    // 2. Cek event masih bisa didaftar
    if (event.status === 'DONE')
      throw new BadRequestException('Event sudah selesai');

    // 3. Cek kuota
    if (event._count.pendaftaran >= event.kuota)
      throw new BadRequestException('Kuota event sudah penuh');

    // 4. Cek sudah pernah daftar di event ini
    const existing = await this.prisma.pendaftaran.findUnique({
      where: { userId_eventId: { userId, eventId: dto.eventId } },
    });
    if (existing)
      throw new BadRequestException('Kamu sudah mendaftar di event ini');

    // 5. Simpan pendaftaran
    return this.prisma.pendaftaran.create({
      data: {
        userId,
        eventId: dto.eventId,
        motivasi: dto.motivasi,
        kesehatan: dto.kesehatan,
        izin: dto.izin,
        nik: dto.nik,
        alamat: dto.alamat,
        tanggalLahir: new Date(dto.tanggalLahir),
        noHp: dto.noHp,
      },
      include: {
        event: {
          select: { judul: true, tanggal: true, lokasi: true },
        },
      },
    });
  }

  async myPendaftaran(userId: string) {
    return this.prisma.pendaftaran.findMany({
      where: { userId },
      include: {
        event: {
          select: {
            id: true,
            judul: true,
            tanggal: true,
            lokasi: true,
            gambar: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPesertaEvent(eventId: string) {
    return this.prisma.pendaftaran.findMany({
      where: { eventId },
      include: {
        user: {
          select: {
            id: true,
            nama: true,
            email: true,
            foto: true,
            noHp: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(id: string) {
    const data = await this.prisma.pendaftaran.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, nama: true, email: true, foto: true } },
        event: {
          select: { id: true, judul: true, tanggal: true, lokasi: true },
        },
      },
    });
    if (!data) throw new NotFoundException('Pendaftaran tidak ditemukan');
    return data;
  }

  async updateStatus(id: string, dto: UpdateStatusDto) {
    await this.findOne(id);
    return this.prisma.pendaftaran.update({
      where: { id },
      data: { status: dto.status },
      include: {
        user: { select: { nama: true, email: true } },
        event: { select: { judul: true } },
      },
    });
  }

  async cekStatus(userId: string, eventId: string) {
    const data = await this.prisma.pendaftaran.findUnique({
      where: { userId_eventId: { userId, eventId } },
    });
    return { terdaftar: !!data, status: data?.status || null };
  }
}
