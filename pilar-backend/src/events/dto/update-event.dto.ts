import { PartialType } from '@nestjs/mapped-types';
import { CreateEventDto } from './create-event.dto';
import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { StatusEvent } from '@prisma/client';

export class UpdateEventDto extends PartialType(CreateEventDto) {
  // Override tanggal: saat EDIT, event yang sudah lewat (ONGOING/DONE) boleh
  // disimpan ulang tanpa harus mengubah tanggalnya, jadi aturan "tidak boleh
  // masa lalu" sengaja tidak diterapkan di sini.
  @IsOptional()
  @IsDateString({}, { message: 'Format tanggal tidak valid' })
  tanggal?: string;

  @IsOptional()
  @IsEnum(StatusEvent)
  status?: StatusEvent;
}
