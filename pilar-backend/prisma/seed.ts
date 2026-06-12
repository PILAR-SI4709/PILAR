import { PrismaClient, Role, StatusEvent, StatusPendaftaran } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SEED_EVENT_TITLES = [
  'Bersih Pantai Kenjeran',
  'Bersih Pantai Kuta',
  'Bersih Pantai Parangtritis',
];

const NOMOR_SERTIFIKAT = 'PILAR-2026-SEED-001';

async function main() {
  // --- USERS ---
  const adminPassword = await bcrypt.hash('admin123', 10);
  const relawanPassword = await bcrypt.hash('relawan123', 10);
  const hapusPassword = await bcrypt.hash('Hapus123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@pilar.id' },
    update: { password: adminPassword, role: Role.ADMIN, nama: 'Admin PILAR' },
    create: {
      nama: 'Admin PILAR',
      email: 'admin@pilar.id',
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  const relawan = await prisma.user.upsert({
    where: { email: 'relawan@pilar.id' },
    update: { password: relawanPassword, role: Role.USER, nama: 'Relawan PILAR' },
    create: {
      nama: 'Relawan PILAR',
      email: 'relawan@pilar.id',
      password: relawanPassword,
      role: Role.USER,
    },
  });

  await prisma.user.upsert({
    where: { email: 'hapus@pilar.test' },
    update: { password: hapusPassword, role: Role.USER, nama: 'Akun Hapus Test' },
    create: {
      nama: 'Akun Hapus Test',
      email: 'hapus@pilar.test',
      password: hapusPassword,
      role: Role.USER,
    },
  });

  // --- CLEANUP existing seed events (cascade deletes all related data) ---
  await prisma.event.deleteMany({ where: { judul: { in: SEED_EVENT_TITLES } } });

  // --- EVENTS ---
  const eventA = await prisma.event.create({
    data: {
      judul: 'Bersih Pantai Kenjeran',
      deskripsi: 'Kegiatan pembersihan pantai Kenjeran bersama komunitas peduli lingkungan.',
      lokasi: 'Surabaya',
      tanggal: new Date('2026-03-15T07:00:00.000Z'),
      kuota: 30,
      status: StatusEvent.DONE,
      adminId: admin.id,
      tugasRelawan: 'Memungut sampah plastik di sepanjang garis pantai.',
      kriteriaRelawan: 'Sehat jasmani dan rohani, siap bekerja di pantai.',
      perlengkapan: 'Sarung tangan, sepatu bot, kantong sampah.',
      domisili: 'Surabaya dan sekitarnya',
    },
  });

  const eventB = await prisma.event.create({
    data: {
      judul: 'Bersih Pantai Kuta',
      deskripsi: 'Aksi bersih pantai Kuta untuk menjaga kebersihan destinasi wisata.',
      lokasi: 'Bali',
      tanggal: new Date('2026-09-20T07:00:00.000Z'),
      kuota: 50,
      status: StatusEvent.UPCOMING,
      adminId: admin.id,
      tugasRelawan: 'Pembersihan sampah di area pesisir dan laut dangkal.',
      kriteriaRelawan: 'Bisa berenang adalah nilai tambah.',
      perlengkapan: 'Baju renang, kacamata snorkel, jaring sampah.',
      domisili: 'Bali',
    },
  });

  const eventC = await prisma.event.create({
    data: {
      judul: 'Bersih Pantai Parangtritis',
      deskripsi: 'Pembersihan pantai Parangtritis bersama warga lokal.',
      lokasi: 'Yogyakarta',
      tanggal: new Date('2026-06-10T07:00:00.000Z'),
      kuota: 40,
      status: StatusEvent.ONGOING,
      adminId: admin.id,
      tugasRelawan: 'Memilah sampah organik dan anorganik.',
      kriteriaRelawan: 'Minimal usia 17 tahun.',
      perlengkapan: 'Sarung tangan, masker, kantong plastik berwarna.',
      domisili: 'Yogyakarta dan sekitarnya',
    },
  });

  // --- PENDAFTARAN ---
  const pdftRelawanA = await prisma.pendaftaran.create({
    data: {
      userId: relawan.id,
      eventId: eventA.id,
      status: StatusPendaftaran.APPROVED,
      motivasi: 'Ingin berkontribusi nyata menjaga kebersihan pantai dan ekosistem laut.',
      nik: '3578101234560001',
      alamat: 'Jl. Kenjeran No. 12, Surabaya',
      tanggalLahir: new Date('2000-05-14'),
      noHp: '081234567890',
      izin: true,
      kesehatan: {
        tidakAdaPenyakitJantung: true,
        tidakAdaAsma: true,
        bisaBerjalanJauh: true,
        tidakAlergiLaut: true,
        tidakHamilAtauMenyusui: true,
      },
    },
  });

  // Extra pendaftar Event B (UPCOMING) — 2 PENDING
  await prisma.pendaftaran.createMany({
    data: [
      {
        userId: admin.id,
        eventId: eventB.id,
        status: StatusPendaftaran.PENDING,
        motivasi: 'Mendukung kebersihan Bali.',
        nik: '5171020000010001',
        alamat: 'Jl. Sunset Road No. 5, Kuta, Bali',
        tanggalLahir: new Date('1995-08-20'),
        noHp: '08119900001',
        izin: true,
        kesehatan: { tidakAdaPenyakitJantung: true, bisaBerjalanJauh: true },
      },
      {
        userId: relawan.id,
        eventId: eventB.id,
        status: StatusPendaftaran.APPROVED,
        motivasi: 'Bali harus tetap bersih.',
        nik: '3578101234560002',
        alamat: 'Jl. Pantai Kuta No. 3, Bali',
        tanggalLahir: new Date('2001-02-10'),
        noHp: '081234567891',
        izin: true,
        kesehatan: { tidakAdaPenyakitJantung: true, bisaBerjalanJauh: true },
      },
    ],
    skipDuplicates: true,
  });

  // Extra pendaftar Event C (ONGOING) — 1 APPROVED
  await prisma.pendaftaran.createMany({
    data: [
      {
        userId: relawan.id,
        eventId: eventC.id,
        status: StatusPendaftaran.APPROVED,
        motivasi: 'Parangtritis adalah pantai favorit saya.',
        nik: '3578101234560003',
        alamat: 'Jl. Malioboro No. 10, Yogyakarta',
        tanggalLahir: new Date('1998-11-30'),
        noHp: '081234567892',
        izin: true,
        kesehatan: { tidakAdaPenyakitJantung: true, bisaBerjalanJauh: true },
      },
    ],
    skipDuplicates: true,
  });

  // --- SAMPAH (Event A — DONE) ---
  await prisma.sampah.createMany({
    data: [
      { eventId: eventA.id, jenis: 'Plastik', jumlahKg: 12.5, catatan: 'Botol dan kantong plastik' },
      { eventId: eventA.id, jenis: 'Logam',   jumlahKg: 4.0,  catatan: 'Kaleng dan besi tua' },
      { eventId: eventA.id, jenis: 'Organik', jumlahKg: 8.2,  catatan: 'Sisa makanan dan dedaunan' },
    ],
  });

  // --- DOKUMENTASI (Event A — DONE) ---
  await prisma.dokumentasi.createMany({
    data: [
      {
        eventId: eventA.id,
        userId: admin.id,
        fotoUrl: 'https://picsum.photos/seed/pilar-kenjeran-1/800/600',
        caption: 'Relawan baris sebelum memulai aksi bersih pantai.',
      },
      {
        eventId: eventA.id,
        userId: admin.id,
        fotoUrl: 'https://picsum.photos/seed/pilar-kenjeran-2/800/600',
        caption: 'Pengumpulan sampah plastik di area tepi laut.',
      },
      {
        eventId: eventA.id,
        userId: admin.id,
        fotoUrl: 'https://picsum.photos/seed/pilar-kenjeran-3/800/600',
        caption: 'Foto bersama setelah kegiatan selesai.',
      },
    ],
  });

  // --- SERTIFIKAT (relawan APPROVED di Event A DONE) ---
  const existingSert = await prisma.sertifikat.findUnique({
    where: { nomorSertifikat: NOMOR_SERTIFIKAT },
  });
  if (!existingSert) {
    await prisma.sertifikat.create({
      data: {
        userId: relawan.id,
        eventId: eventA.id,
        pendaftaranId: pdftRelawanA.id,
        nomorSertifikat: NOMOR_SERTIFIKAT,
        issuedAt: new Date('2026-04-01T00:00:00.000Z'),
      },
    });
  }

  // --- SUMMARY ---
  console.log('\n========== PILAR SEED SELESAI ==========');
  console.log('Akun Admin  : admin@pilar.id        / admin123');
  console.log('Akun Relawan: relawan@pilar.id       / relawan123');
  console.log('Akun Hapus  : hapus@pilar.test       / Hapus123!');
  console.log(`Event A (DONE)     : ${eventA.id}  — Bersih Pantai Kenjeran`);
  console.log(`Event B (UPCOMING) : ${eventB.id}  — Bersih Pantai Kuta`);
  console.log(`Event C (ONGOING)  : ${eventC.id}  — Bersih Pantai Parangtritis`);
  console.log(`Nomor Sertifikat   : ${NOMOR_SERTIFIKAT}`);
  console.log('=========================================\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
