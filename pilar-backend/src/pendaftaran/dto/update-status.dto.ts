import { IsEnum } from 'class-validator';
import { StatusPendaftaran } from '@prisma/client';

export class UpdateStatusDto {
  @IsEnum(StatusPendaftaran)
  status!: StatusPendaftaran;
}