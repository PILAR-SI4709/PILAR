import { IsOptional, IsString, IsBoolean, Matches } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional() @IsString()
  nama?: string;

  @IsOptional() @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  @Matches(/^(\+62|62|0)[0-9]{8,13}$/, {
    message: 'Nomor HP tidak valid (gunakan format 08xxxx atau +62xxxx, 10-15 digit)',
  })
  noHp?: string;

  @IsOptional() @IsString()
  foto?: string;

  // TASK 7 - Preferensi notifikasi email (disimpan ke backend).
  @IsOptional() @IsBoolean()
  emailNotificationEnabled?: boolean;

  @IsOptional() @IsBoolean()
  reminderNotificationEnabled?: boolean;
}
