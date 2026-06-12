import { Module } from '@nestjs/common';
import { LaporanService } from './laporan.service';
import { LaporanController } from './laporan.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LaporanController],
  providers: [LaporanService],
})
export class LaporanModule {}