import { Module } from '@nestjs/common';
import { SertifikatService } from './sertifikat.service';
import { SertifikatController } from './sertifikat.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SertifikatController],
  providers: [SertifikatService],
  exports: [SertifikatService],
})
export class SertifikatModule {}
