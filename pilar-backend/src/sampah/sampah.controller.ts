import { Controller, Post, Get, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { SampahService } from './sampah.service';
import { CreateSampahDto } from './dto/create-sampah.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('sampah')
export class SampahController {
  constructor(private sampahService: SampahService) {}










   // PBI #39 - Naufal Athalino - Detail Laporan Event (data sampah per event)
  @Get('event/:eventId')
  getByEvent(@Param('eventId') eventId: string) {
    return this.sampahService.getByEvent(eventId);
  }