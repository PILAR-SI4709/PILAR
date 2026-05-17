import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';
import { UsersModule } from './users/users.module';
import { PendaftaranModule } from './pendaftaran/pendaftaran.module';
import { SertifikatModule } from './sertifikat/sertifikat.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    EventsModule,
    UsersModule,
    PendaftaranModule,
    SertifikatModule,
  ],
})
export class AppModule {}