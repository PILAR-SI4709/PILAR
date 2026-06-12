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

    // TASK 6 - Sisa kuota dihitung dari kuota dikurangi relawan DITERIMA (APPROVED).
    const relawanDiterima = await this.prisma.pendaftaran.count({
      where: { eventId: id, status: 'APPROVED' },
    });

    return { ...event, relawanDiterima };
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

  // PBI #22 - Muhammad Faris Alfaqih - Statistik Sampah Terpilah Dashboard Admin
  // Statistik dashboard (per-event + ringkasan untuk dashboard admin Faris)
  async getStats() {
    const [totalEvent, totalRelawan, sampahData, sampahGroup] = await Promise.all([
      this.prisma.event.count(),
      this.prisma.pendaftaran.count({
        where: { status: 'APPROVED' },
      }),
      this.prisma.sampah.aggregate({
        _sum: { jumlahKg: true },
      }),
      // PBI #22 - Statistik sampah terpilah per jenis (Plastik, Kaca, Logam, dst).
      this.prisma.sampah.groupBy({
        by: ['jenis'],
        _sum: { jumlahKg: true },
        orderBy: { _sum: { jumlahKg: 'desc' } },
      }),
    ]);

    const sampahPerJenis = sampahGroup.map((s) => ({
      jenis: s.jenis,
      totalKg: s._sum.jumlahKg || 0,
    }));

    return {
      totalEvent,
      totalRelawan,
      totalSampahKg: sampahData._sum.jumlahKg || 0,
      sampahPerJenis,
    };
  }

  // PBI #40 - Naufal Athalino - Halaman Rekap Statistik Keseluruhan Program
  // Rekap agregat seluruh event untuk evaluasi capaian program (halaman terpisah)
  async getRekap() {
    const [sampahData, totalRelawanAktif, totalEventSelesai] = await Promise.all([
      this.prisma.sampah.aggregate({
        _sum: { jumlahKg: true },
      }),
      this.prisma.pendaftaran.count({
        where: { status: 'APPROVED' },
      }),
      this.prisma.event.count({
        where: { status: 'DONE' },
      }),
    ]);

    return {
      totalSampahKg: sampahData._sum.jumlahKg || 0,
      totalRelawanAktif,
      totalEventSelesai,
    };
  }
}