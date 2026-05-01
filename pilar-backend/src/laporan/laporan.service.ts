import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class LaporanService {
  constructor(private prisma: PrismaService) {}

  async getLaporanEvent(eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        admin: { select: { nama: true, foto: true } },
      },
    });
    if (!event) throw new NotFoundException("Event tidak ditemukan");

    const [peserta, dokumentasi, sampah] = await Promise.all([
      this.prisma.pendaftaran.findMany({
        where: { eventId, status: "APPROVED" },
        include: {
          user: { select: { id: true, nama: true, foto: true, email: true } },
        },
      }),
      this.prisma.dokumentasi.findMany({
        where: { eventId },
        include: {
          user: { select: { nama: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.sampah.findMany({
        where: { eventId },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    const totalSampahKg = sampah.reduce((sum, s) => sum + s.jumlahKg, 0);

    return {
      event,
      ringkasan: {
        totalPeserta: peserta.length,
        totalDokumentasi: dokumentasi.length,
        totalSampahKg,
      },
      peserta,
      dokumentasi,
      sampah,
    };
  }

  async getAllLaporan() {
    const events = await this.prisma.event.findMany({
      include: {
        _count: {
          select: {
            pendaftaran: true,
            dokumentasi: true,
            sampah: true,
          },
        },
      },
      orderBy: { tanggal: "desc" },
    });
    return events;
  }
}
