import {
  Controller, Post, Get, Delete,
  Param, Body, UseGuards, Request,
  UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { DokumentasiService } from './dokumentasi.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

const dokDir = join(process.cwd(), 'uploads', 'dokumentasi');
if (!existsSync(dokDir)) mkdirSync(dokDir, { recursive: true });

@Controller('dokumentasi')
export class DokumentasiController {
  constructor(private dokumentasiService: DokumentasiService) {}

  // Upload foto (user yang terdaftar di event)
  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('foto', {
    storage: diskStorage({
      destination: dokDir,
      filename: (req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random()*1e6)}`;
        cb(null, `${unique}${extname(file.originalname)}`);
      },
    }),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      file.mimetype.startsWith('image/') ? cb(null, true) : cb(new Error('File harus gambar'), false);
    },
  }))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('eventId') eventId: string,
    @Body('caption') caption: string,
    @Request() req,
  ) {
    const fotoUrl = `http://localhost:3001/uploads/dokumentasi/${file.filename}`;
    return this.dokumentasiService.create(eventId, req.user.id, fotoUrl, caption);
  }

  // PBI #32 - Feyza Adyani - Upload Foto Dokumentasi Kegiatan oleh Admin
  // Upload foto oleh admin untuk event apapun
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('upload-admin')
  @UseInterceptors(FileInterceptor('foto', {
    storage: diskStorage({
      destination: dokDir,
      filename: (req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random()*1e6)}`;
        cb(null, `${unique}${extname(file.originalname)}`);
      },
    }),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      file.mimetype.startsWith('image/') ? cb(null, true) : cb(new Error('File harus gambar'), false);
    },
  }))
  async uploadAdmin(
    @UploadedFile() file: Express.Multer.File,
    @Body('eventId') eventId: string,
    @Body('caption') caption: string,
    @Request() req,
  ) {
    const fotoUrl = `http://localhost:3001/uploads/dokumentasi/${file.filename}`;
    return this.dokumentasiService.createAdmin(eventId, req.user.id, fotoUrl, caption);
  }

  @Get('event/:eventId')
  getByEvent(@Param('eventId') eventId: string) {
    return this.dokumentasiService.getByEvent(eventId);
  }

  // PBI #33 - Feyza Adyani - Hapus Foto Dokumentasi dari Galeri Admin
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Param('id') id: string, @Request() req) {
    return this.dokumentasiService.delete(id, req.user.id);
  }
}