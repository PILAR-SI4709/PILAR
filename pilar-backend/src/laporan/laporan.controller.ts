import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { LaporanService } from './laporan.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('laporan')
export class LaporanController {
  constructor(private laporanService: LaporanService) {}

  // PBI #38 - Naufal Athalino - Halaman Daftar Laporan Kegiatan
  @UseGuards(JwtAuthGuard)
  @Get()
  getAllLaporan() {
    return this.laporanService.getAllLaporan();
  }

  // PBI #39 - Naufal Athalino - Detail Laporan Event (peserta, sampah, dokumentasi)
  @UseGuards(JwtAuthGuard)
  @Get(':eventId')
  getLaporanEvent(@Param('eventId') eventId: string) {
    return this.laporanService.getLaporanEvent(eventId);
  }
}