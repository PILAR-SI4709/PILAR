import {
  IsNotEmpty, IsDateString, IsBoolean,
  IsObject, IsString, Matches, MaxLength, Equals,
} from 'class-validator';
import { IsValidBirthDate } from '../../common/validators/date.validators';

// TASK 2 - Validasi menyeluruh pendaftaran relawan (pesan error Bahasa Indonesia).
export class CreatePendaftaranDto {
  @IsNotEmpty({ message: 'Event wajib dipilih' })
  eventId!: string;

  @IsString()
  @IsNotEmpty({ message: 'Motivasi wajib diisi' })
  @MaxLength(500, { message: 'Motivasi maksimal 500 karakter' })
  motivasi!: string;

  @IsObject({ message: 'Data kesehatan tidak valid' })
  kesehatan!: Record<string, boolean>;

  @IsBoolean({ message: 'Pernyataan izin tidak valid' })
  @Equals(true, { message: 'Kamu harus menyetujui pernyataan izin' })
  izin!: boolean;

  @IsNotEmpty({ message: 'NIK wajib diisi' })
  @Matches(/^\d{16}$/, { message: 'NIK harus tepat 16 digit angka' })
  nik!: string;

  @IsNotEmpty({ message: 'Alamat wajib diisi' })
  alamat!: string;

  @IsDateString({}, { message: 'Format tanggal lahir tidak valid' })
  @IsValidBirthDate(17)
  tanggalLahir!: string;

  @IsString()
  @IsNotEmpty({ message: 'Nomor HP wajib diisi' })
  @Matches(/^(\+62|62|0)[0-9]{8,13}$/, {
    message: 'Nomor HP tidak valid (gunakan format 08xxxx atau +62xxxx, 10-15 digit)',
  })
  noHp!: string;
}
