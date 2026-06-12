  import {
  Injectable, BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePendaftaranDto } from './dto/create-pendaftaran.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { KESEHATAN_WAJIB, labelKesehatan } from './kesehatan.config';
import { MailService } from '../mail/mail.service';

@Injectable()
export class PendaftaranService {
  constructor(
    private prisma: PrismaService,
    private mail: MailService,
  ) {}

  async daftar(dto: CreatePendaftaranDto, userId: string) {
    // 1. Cek event ada
    const event = await this.prisma.event.findUnique({
      where: { id: dto.eventId },
    });
    if (!event)
      throw new NotFoundException('Event tidak ditemukan');

    // 2. Cek event masih bisa didaftar
    if (event.status === 'DONE')
      throw new BadRequestException('Event sudah selesai');

    // 3. Cek kuota — dihitung dari relawan DITERIMA (APPROVED), selaras dengan
    //    "sisa kuota" di halaman detail event (TASK 6). Pendaftar PENDING/REJECTED
    //    tidak menghabiskan kuota.
    const relawanDiterima = await this.prisma.pendaftaran.count({
      where: { eventId: dto.eventId, status: 'APPROVED' },
    });
    if (relawanDiterima >= event.kuota)
      throw new BadRequestException('Kuota event sudah penuh');

    // 4. Cek sudah pernah daftar di event ini
    const existing = await this.prisma.pendaftaran.findUnique({
      where: { userId_eventId: { userId, eventId: dto.eventId } },
    });
    if (existing)
      throw new BadRequestException('Kamu sudah mendaftar di event ini');

    // 5. TASK 4 - Auto-reject berdasarkan form kesehatan.
    //    Jika ada pernyataan kesehatan WAJIB yang tidak dicentang, pendaftaran
    //    langsung berstatus REJECTED (ditolak otomatis oleh sistem).
    const kesehatan = (dto.kesehatan || {}) as Record<string, boolean>;
    const tidakTerpenuhi = KESEHATAN_WAJIB.filter((key) => kesehatan[key] !== true);

    let status: 'PENDING' | 'REJECTED' = 'PENDING';
    let autoRejected = false;
    let alasanReject: string | null = null;

    if (tidakTerpenuhi.length > 0) {
      status = 'REJECTED';
      autoRejected = true;
      alasanReject =
        'Ditolak otomatis: tidak memenuhi kriteria kesehatan wajib (' +
        tidakTerpenuhi.map(labelKesehatan).join(', ') +
        ').';
    }

    // 6. Simpan pendaftaran
    return this.prisma.pendaftaran.create({
      data: {
        userId,
        eventId: dto.eventId,
        motivasi: dto.motivasi,
        kesehatan: dto.kesehatan,
        izin: dto.izin,
        status,
        autoRejected,
        alasanReject,
        nik: dto.nik,
        alamat: dto.alamat,
        tanggalLahir: new Date(dto.tanggalLahir),
        noHp: dto.noHp,
      },
      include: {
        event: {
          select: { judul: true, tanggal: true, lokasi: true },
        },
      },
    });
  }

  async myPendaftaran(userId: string) {
    return this.prisma.pendaftaran.findMany({
      where: { userId },
      include: {
        event: {
          select: {
            id: true, judul: true, tanggal: true,
            lokasi: true, gambar: true, status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // #PBI16 - Lihat Peserta: Mengambil seluruh data peserta beserta info user untuk suatu event
  async getPesertaEvent(eventId: string) {
    return this.prisma.pendaftaran.findMany({
      where: { eventId },
      include: {
        user: {
          select: {
            id: true, nama: true, email: true,
            foto: true, noHp: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  // PBI #37 - Marshall Rasendria - Detail Lengkap Data Pendaftaran Peserta
  async findOne(id: string) {
    const data = await this.prisma.pendaftaran.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, nama: true, email: true, foto: true } },
        event: { select: { id: true, judul: true, tanggal: true, lokasi: true } },
      },
    });
    if (!data) throw new NotFoundException('Pendaftaran tidak ditemukan');
    return data;
  }

  // #PBI17 - Update Status Partisipasi: Memperbarui status pendaftaran menjadi APPROVED atau REJECTED
  // #PBI18 - Validasi Peserta: Status APPROVED berarti peserta telah divalidasi oleh admin
  // PBI #34 - Marshall Rasendria - Generate Sertifikat Otomatis Saat Pendaftaran Disetujui
  // Catatan: setelah update status APPROVED, panggil sertifikatService.generate() secara otomatis
  async updateStatus(id: string, dto: UpdateStatusDto) {
    await this.findOne(id);
    // Keputusan manual admin menggantikan auto-reject sistem: bersihkan flag.
    const updated = await this.prisma.pendaftaran.update({
      where: { id },
      data: { status: dto.status, autoRejected: false, alasanReject: null },
      include: {
        user: { select: { nama: true, email: true, emailNotificationEnabled: true } },
        event: { select: { judul: true } },
      },
    });

    // TASK 7 - Kirim email notifikasi saat status DITERIMA / DITOLAK,
    // hanya jika relawan mengaktifkan preferensi notifikasi email.
    if (
      (dto.status === 'APPROVED' || dto.status === 'REJECTED') &&
      updated.user?.email &&
      updated.user.emailNotificationEnabled
    ) {
      // Tidak di-await agar respon API tidak menunggu SMTP; kegagalan email
      // tidak boleh menggagalkan perubahan status.
      void this.mail.sendStatusPendaftaran(
        updated.user.email,
        updated.user.nama,
        updated.event.judul,
        dto.status,
      );
    }

    return updated;
  }

  async cekStatus(userId: string, eventId: string) {
    const data = await this.prisma.pendaftaran.findUnique({
      where: { userId_eventId: { userId, eventId } },
    });
    return { terdaftar: !!data, status: data?.status || null };
  }
}