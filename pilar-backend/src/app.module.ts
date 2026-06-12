import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';
import { PendaftaranModule } from './pendaftaran/pendaftaran.module';
import { DokumentasiModule } from './dokumentasi/dokumentasi.module';
import { SampahModule } from './sampah/sampah.module';
import { LaporanModule } from './laporan/laporan.module';
import { SertifikatModule } from './sertifikat/sertifikat.module';
import { UsersModule } from './users/users.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    MailModule,
    AuthModule,
    EventsModule,
    PendaftaranModule,
    DokumentasiModule,
    SampahModule,
    LaporanModule,
    SertifikatModule,
    UsersModule,
  ],
})
export class AppModule {}