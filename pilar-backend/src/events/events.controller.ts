import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards, Request,
  UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
 
// Pastikan folder uploads/events ada
const uploadDir = join(process.cwd(), 'uploads', 'events');
if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });

@Controller('events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Get()
  findAll(@Query('status') status?: string) {
    return this.eventsService.findAll(status);
  }

  @Get('stats')
  getStats() {
    return this.eventsService.getStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  create(@Body() dto: CreateEventDto, @Request() req) {
    return this.eventsService.create(dto, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEventDto, @Request() req) {
    return this.eventsService.update(id, dto, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.eventsService.remove(id, req.user.id);
  }

  // Upload gambar ke lokal server
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('upload-gambar')
  @UseInterceptors(
    FileInterceptor('gambar', {
      storage: diskStorage({
        destination: uploadDir,
        filename: (req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
          cb(null, `${unique}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          cb(new Error('File harus berupa gambar'), false);
        } else {
          cb(null, true);
        }
      },
    }),
  )
  uploadGambar(@UploadedFile() file: Express.Multer.File) {
    const url = `http://localhost:3001/uploads/events/${file.filename}`;
    return { url };
  }
} 