import { Module } from '@nestjs/common';
import { SampahService } from './sampah.service';
import { SampahController } from './sampah.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SampahController],
  providers: [SampahService],
})
export class SampahModule {}