import { IsNotEmpty, IsDateString, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { IsNotPastDate } from '../../common/validators/date.validators';

export class CreateEventDto {
  @IsNotEmpty({ message: 'Judul event wajib diisi' })
  judul!: string;

  @IsNotEmpty({ message: 'Deskripsi wajib diisi' })
  deskripsi!: string;

  @IsNotEmpty({ message: 'Lokasi wajib diisi' })
  lokasi!: string;

  // TASK 2 - Jadwal event tidak boleh di masa lalu.
  @IsDateString({}, { message: 'Format tanggal tidak valid' })
  @IsNotPastDate({ message: 'Tanggal event tidak boleh di masa lalu' })
  tanggal!: string;

  @Type(() => Number)
  @IsInt({ message: 'Kuota harus berupa angka' })
  @Min(1, { message: 'Kuota minimal 1 relawan' })
  kuota!: number;

  @IsOptional()
  gambar?: string;

  // TASK 6 - Detail kegiatan yang bisa diisi admin (opsional).
  @IsOptional() @IsString()
  tugasRelawan?: string;

  @IsOptional() @IsString()
  kriteriaRelawan?: string;

  @IsOptional() @IsString()
  perlengkapan?: string;

  @IsOptional() @IsString()
  domisili?: string;
}
