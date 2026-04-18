import { Module } from '@nestjs/common';
import { PendaftaranService } from './pendaftaran.service';
import { PendaftaranController } from './pendaftaran.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PendaftaranController],
  providers: [PendaftaranService],
  exports: [PendaftaranService],
})
export class PendaftaranModule {}