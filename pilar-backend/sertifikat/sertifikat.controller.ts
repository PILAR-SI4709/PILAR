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
  @UseGuards(JwtAuthGuard)
  @Post('generate/:pendaftaranId')
  // PBI #28 - Syifa Rizani - Daftar Sertifikat Relawan
  @UseGuards(JwtAuthGuard)
  @Get('my')
  getMySertifikat(@Request() req) {
    return this.sertifikatService.getMySertifikat(req.user.id);
  }
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getById(@Param('id') id: string) {
    return this.sertifikatService.getById(id);
  }

