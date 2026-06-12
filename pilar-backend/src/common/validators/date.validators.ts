import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

// TASK 2 - Validator kustom untuk tanggal.
// Dipakai bersama @IsDateString() pada DTO (class-validator).

/**
 * Memastikan tanggal TIDAK berada di masa lalu (boleh hari ini / masa depan).
 * Cocok untuk jadwal event.
 */
export function IsNotPastDate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isNotPastDate',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (!value) return false;
          const tanggal = new Date(value);
          if (isNaN(tanggal.getTime())) return false;
          const sekarang = new Date();
          // Bandingkan per hari supaya jam tidak membuat "hari ini" gagal.
          const tglOnly = new Date(tanggal.getFullYear(), tanggal.getMonth(), tanggal.getDate());
          const todayOnly = new Date(sekarang.getFullYear(), sekarang.getMonth(), sekarang.getDate());
          return tglOnly.getTime() >= todayOnly.getTime();
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} tidak boleh di masa lalu`;
        },
      },
    });
  };
}

/**
 * Memastikan tanggal lahir valid: tidak di masa depan DAN umur minimal `minAge` tahun.
 */
export function IsValidBirthDate(minAge = 17, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidBirthDate',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [minAge],
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!value) return false;
          const lahir = new Date(value);
          if (isNaN(lahir.getTime())) return false;
          const sekarang = new Date();
          if (lahir.getTime() > sekarang.getTime()) return false; // tidak boleh masa depan

          const min = args.constraints[0] as number;
          let umur = sekarang.getFullYear() - lahir.getFullYear();
          const belumUlangTahun =
            sekarang.getMonth() < lahir.getMonth() ||
            (sekarang.getMonth() === lahir.getMonth() && sekarang.getDate() < lahir.getDate());
          if (belumUlangTahun) umur--;
          return umur >= min;
        },
        defaultMessage(args: ValidationArguments) {
          const min = args.constraints[0] as number;
          return `Tanggal lahir tidak valid (tidak boleh di masa depan dan umur minimal ${min} tahun)`;
        },
      },
    });
  };
}
