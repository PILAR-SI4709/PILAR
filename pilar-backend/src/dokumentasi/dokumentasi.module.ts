import { Module } from '@nestjs/common';
import { DokumentasiService } from './dokumentasi.service';
import { DokumentasiController } from './dokumentasi.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DokumentasiController],
  providers: [DokumentasiService],
})
export class DokumentasiModule {}