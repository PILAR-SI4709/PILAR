import { Controller, Post, Get, Param, UseGuards, Request } from '@nestjs/common';
import { SertifikatService } from './sertifikat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('sertifikat')
export class SertifikatController {
  constructor(private sertifikatService: SertifikatService) {}

  // PBI #29 - Syifa Rizani - Generate dan Unduh Sertifikat PDF
  // User generate sertifikat miliknya
  @UseGuards(JwtAuthGuard)
  @Post('generate/:pendaftaranId')
    // PBI #34 - Marshall Rasendria - Generate Sertifikat Otomatis Saat Pendaftaran Disetujui
  generate(
    @Param('pendaftaranId') pendaftaranId: string,
    @Request() req,
  ) {
    return this.sertifikatService.generate(pendaftaranId, req.user.id);
  }

  // PBI #28 - Syifa Rizani - Daftar Sertifikat Relawan
  // User lihat semua sertifikat miliknya
  @UseGuards(JwtAuthGuard)
  @Get('my')
  getMySertifikat(@Request() req) {
    return this.sertifikatService.getMySertifikat(req.user.id);
  }

  // Detail sertifikat by ID (untuk render di frontend)
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getById(@Param('id') id: string) {
    return this.sertifikatService.getById(id);
  }

  // PBI #36 - Marshall Rasendria - Verifikasi Sertifikat Publik Berdasarkan Nomor Sertifikat
  // Verifikasi sertifikat publik by nomor (tanpa login)
  @Get('verifikasi/:nomor')
  getByNomor(@Param('nomor') nomor: string) {
    return this.sertifikatService.getByNomor(nomor);
  }

  // Admin lihat semua sertifikat per event
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('event/:eventId')
  getByEvent(@Param('eventId') eventId: string) {
    return this.sertifikatService.getByEvent(eventId);
  }
}