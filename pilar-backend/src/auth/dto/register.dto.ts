import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty({ message: 'Nama wajib diisi' })
  nama!: string;

  @IsEmail({}, { message: 'Format email tidak valid' })
  email!: string;

  @MinLength(6, { message: 'Password minimal 6 karakter' })
  password!: string;
}
