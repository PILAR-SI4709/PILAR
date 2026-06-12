import { Module, Global } from '@nestjs/common';
import { MailService } from './mail.service';

// Global agar MailService bisa di-inject di modul manapun tanpa import berulang.
@Global()
@Module({
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
