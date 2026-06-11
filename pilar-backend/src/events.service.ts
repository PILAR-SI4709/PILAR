import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  // Ambil semua event (publik)
  async findAll(status?: string) {
    return this.prisma.event.findMany({
      where: status ? { status: status as any } : {},
      include: {
        admin: { select: { id: true, nama: true, foto: true } },
        _count: { select: { pendaftaran: true } },
      },
      orderBy: { tanggal: 'asc' },
    });
  }

  // Ambil detail satu event
  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        admin: { select: { id: true, nama: true, foto: true } },
        _count: { select: { pendaftaran: true } },
      },
    });
    if (!event) throw new NotFoundException('Event tidak ditemukan');
    return event;
  }

  // Buat event baru (admin only)
  async create(dto: CreateEventDto, adminId: string) {
    return this.prisma.event.create({
      data: {
        ...dto,
        tanggal: new Date(dto.tanggal),
        adminId,
      },
    });
  }

  // Update event (admin only, hanya admin yg buat)
  async update(id: string, dto: UpdateEventDto, adminId: string) {
    const event = await this.findOne(id);
    if (event.adminId !== adminId)
      throw new ForbiddenException('Tidak punya akses');
    return this.prisma.event.update({
      where: { id },
      data: {
        ...dto,
        tanggal: dto.tanggal ? new Date(dto.tanggal) : undefined,
      },
    });
  }

  // Hapus event (admin only)
  async remove(id: string, adminId: string) {
    const event = await this.findOne(id);
    if (event.adminId !== adminId)
      throw new ForbiddenException('Tidak punya akses');
    await this.prisma.event.delete({ where: { id } });
    return { message: 'Event berhasil dihapus' };
  }

  // Statistik dashboard
  async getStats() {
    const [totalEvent, totalRelawan, sampahData] = await Promise.all([
      this.prisma.event.count(),
      this.prisma.pendaftaran.count({
        where: { status: 'APPROVED' },
      }),
      this.prisma.sampah.aggregate({
        _sum: { jumlahKg: true },
      }),
    ]);
    return {
      totalEvent,
      totalRelawan,
      totalSampahKg: sampahData._sum.jumlahKg || 0,
    };
  }
}