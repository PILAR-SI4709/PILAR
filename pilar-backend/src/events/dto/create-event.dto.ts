import { IsNotEmpty, IsDateString, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEventDto {
  @IsNotEmpty()
  judul!: string;

  @IsNotEmpty()
  deskripsi!: string;

  @IsNotEmpty()
  lokasi!: string;

  @IsDateString()
  tanggal!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  kuota!: number;

  @IsOptional()
  gambar?: string;
}