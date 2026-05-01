import {
  Controller, Get, Post, Patch,
  Body, Param, UseGuards, Request,
} from '@nestjs/common';
import { PendaftaranService } from './pendaftaran.service';
import { CreatePendaftaranDto } from './dto/create-pendaftaran.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('pendaftaran')
export class PendaftaranController {
  constructor(private pendaftaranService: PendaftaranService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  daftar(@Body() dto: CreatePendaftaranDto, @Request() req) {
    return this.pendaftaranService.daftar(dto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  myPendaftaran(@Request() req) {
    return this.pendaftaranService.myPendaftaran(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('cek/:eventId')
  cekStatus(@Param('eventId') eventId: string, @Request() req) {
    return this.pendaftaranService.cekStatus(req.user.id, eventId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('event/:eventId')
  getPesertaEvent(@Param('eventId') eventId: string) {
    return this.pendaftaranService.getPesertaEvent(eventId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pendaftaranService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.pendaftaranService.updateStatus(id, dto);
  }
}