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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  create(@Body() dto: CreateSampahDto) {
    return this.sampahService.create(dto);
  }

  @Get('event/:eventId')
  getByEvent(@Param('eventId') eventId: string) {
    return this.sampahService.getByEvent(eventId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.sampahService.delete(id);
  }
}