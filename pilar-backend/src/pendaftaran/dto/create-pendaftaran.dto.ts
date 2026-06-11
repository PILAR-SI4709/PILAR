import {
  IsNotEmpty, IsDateString, IsBoolean,
  IsObject, IsString,
} from 'class-validator';

export class CreatePendaftaranDto {
  @IsNotEmpty()
  eventId!: string;

  @IsNotEmpty()
  motivasi!: string;

  @IsObject()
  kesehatan!: object;

  @IsBoolean()
  izin!: boolean;

  @IsNotEmpty()
  nik!: string;

  @IsNotEmpty()
  alamat!: string;

  @IsDateString()
  tanggalLahir!: string;

  @IsString()
  @IsNotEmpty()
  noHp!: string;
}