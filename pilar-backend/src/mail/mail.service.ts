import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

// TASK 7 - Layanan pengiriman email (SMTP via nodemailer).
// Kredensial diambil dari environment variables, TIDAK di-hardcode:
//   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private from: string;

  constructor(private config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST');
    const port = Number(this.config.get<string>('SMTP_PORT') || 587);
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');
    this.from = this.config.get<string>('SMTP_FROM') || 'PILAR <no-reply@pilar.id>';

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465, // 465 = SSL, selain itu STARTTLS
        auth: { user, pass },
      });
      this.logger.log(`SMTP siap (host: ${host}:${port})`);
    } else {
      this.logger.warn(
        'SMTP belum dikonfigurasi (SMTP_HOST/SMTP_USER/SMTP_PASS kosong). Email tidak akan dikirim.',
      );
    }
  }

  // Pengiriman email generik & reusable.
  async sendMail(opts: { to: string; subject: string; html: string }): Promise<boolean> {
    if (!this.transporter) {
      this.logger.warn(`Lewati kirim email ke ${opts.to} — SMTP tidak aktif.`);
      return false;
    }
    try {
      await this.transporter.sendMail({
        from: this.from,
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
      });
      this.logger.log(`Email terkirim ke ${opts.to}: ${opts.subject}`);
      return true;
    } catch (err) {
      this.logger.error(`Gagal kirim email ke ${opts.to}`, err as Error);
      return false;
    }
  }

  // TASK 7 - Template email saat status pendaftaran relawan berubah.
  async sendStatusPendaftaran(
    to: string,
    nama: string,
    judulEvent: string,
    status: 'APPROVED' | 'REJECTED',
  ): Promise<boolean> {
    const diterima = status === 'APPROVED';
    const judul = diterima
      ? 'Pendaftaran Relawan Diterima'
      : 'Pendaftaran Relawan Ditolak';
    const warna = diterima ? '#059669' : '#dc2626';
    const pesan = diterima
      ? `Selamat! Pendaftaranmu sebagai relawan pada kegiatan <strong>${judulEvent}</strong> telah <strong>DITERIMA</strong>. Sampai jumpa di lokasi kegiatan.`
      : `Mohon maaf, pendaftaranmu sebagai relawan pada kegiatan <strong>${judulEvent}</strong> belum dapat kami terima kali ini. Tetap semangat dan nantikan kegiatan berikutnya.`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
        <div style="background: ${warna}; padding: 20px 24px;">
          <h2 style="color: #ffffff; margin: 0; font-size: 18px;">PILAR — ${judul}</h2>
        </div>
        <div style="padding: 24px;">
          <p style="color: #374151; font-size: 14px; line-height: 1.7;">Halo <strong>${nama}</strong>,</p>
          <p style="color: #374151; font-size: 14px; line-height: 1.7;">${pesan}</p>
          <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">Email ini dikirim otomatis oleh sistem PILAR (Peduli Laut dan Pesisir).</p>
        </div>
      </div>
    `;

    return this.sendMail({ to, subject: `[PILAR] ${judul} — ${judulEvent}`, html });
  }

  // TODO TASK 7 - Tambahkan template email lain di sini bila diperlukan, mis:
  //   - sendPengingatEvent(to, nama, judulEvent, tanggal)  // H-1 sebelum event
  //   - sendKonfirmasiPendaftaran(to, nama, judulEvent)    // saat user baru mendaftar
}
