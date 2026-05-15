import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSampahDto } from './dto/create-sampah.dto';

@Injectable()
export class SampahService {
  constructor(private prisma: PrismaService) {}

  // PBI #31 - Feyza Adyani - Form Input Data Sampah Per Event
  async create(dto: CreateSampahDto) {
    const event = await this.prisma.event.findUnique({
      where: { id: dto.eventId },
    });
    if (!event) throw new NotFoundException('Event tidak ditemukan');

    return this.prisma.sampah.create({ data: dto });
  }