import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDokumentasiDto {
  @IsNotEmpty()
  eventId!: string;

  @IsOptional()
  @IsString()
  caption?: string;
}