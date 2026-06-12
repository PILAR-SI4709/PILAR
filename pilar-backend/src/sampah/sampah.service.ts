import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSampahDto } from './dto/create-sampah.dto';

@Injectable()
export class SampahService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSampahDto) {
    const event = await this.prisma.event.findUnique({
      where: { id: dto.eventId },
    });
    if (!event) throw new NotFoundException('Event tidak ditemukan');

    return this.prisma.sampah.create({ data: dto });
  }

  async getByEvent(eventId: string) {
    const data = await this.prisma.sampah.findMany({
      where: { eventId },
      orderBy: { createdAt: 'asc' },
    });

    const total = await this.prisma.sampah.aggregate({
      where: { eventId },
      _sum: { jumlahKg: true },
    });

    return {
      items: data,
      totalKg: total._sum.jumlahKg || 0,
    };
  }

  async delete(id: string) {
    const data = await this.prisma.sampah.findUnique({ where: { id } });
    if (!data) throw new NotFoundException('Data sampah tidak ditemukan');
    await this.prisma.sampah.delete({ where: { id } });
    return { message: 'Data sampah dihapus' };
  }
}