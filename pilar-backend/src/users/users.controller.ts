import {
  Controller, Get, Patch, Post, Body,
  UseGuards, Request, UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

const avatarDir = join(process.cwd(), 'uploads', 'avatars');
if (!existsSync(avatarDir)) mkdirSync(avatarDir, { recursive: true });

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return this.usersService.getProfile(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  updateProfile(@Request() req, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('stats')
  getStats(@Request() req) {
    return this.usersService.getStats(req.user.id);
  }

  // --- TAMBAHAN BARU: Endpoint Ganti Password ---
  @UseGuards(JwtAuthGuard)
  @Patch('password')
  changePassword(@Request() req, @Body() body: any) {
    return this.usersService.changePassword(req.user.id, body.passwordLama, body.passwordBaru);
  }
  // ----------------------------------------------

  // Upload foto profil
  @UseGuards(JwtAuthGuard)
  @Post('upload-foto')
  @UseInterceptors(
    FileInterceptor('foto', {
      storage: diskStorage({
        destination: avatarDir,
        filename: (req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
          cb(null, `${unique}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 2 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          cb(new Error('File harus berupa gambar'), false);
        } else {
          cb(null, true);
        }
      },
    }),
  )
  async uploadFoto(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    const fotoUrl = `http://localhost:3001/uploads/avatars/${file.filename}`;
    // Simpan URL foto ke database
    const user = await this.usersService.updateProfile(req.user.id, { foto: fotoUrl });
    return { url: fotoUrl, user };
  }
}