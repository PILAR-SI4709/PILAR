import { IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional() @IsString()
  nama?: string;

  @IsOptional() @IsString()
  bio?: string;

  @IsOptional() @IsString()
  noHp?: string;

  @IsOptional() @IsString()
  foto?: string;
}