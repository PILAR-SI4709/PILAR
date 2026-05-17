import { IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSampahDto {
  @IsNotEmpty()
  eventId!: string;

  @IsNotEmpty()
  jenis!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0.1)
  jumlahKg!: number;

  @IsOptional()
  catatan?: string;
}