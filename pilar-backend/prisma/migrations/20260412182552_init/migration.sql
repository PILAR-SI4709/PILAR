-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "StatusPendaftaran" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "StatusEvent" AS ENUM ('UPCOMING', 'ONGOING', 'DONE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "foto" TEXT,
    "bio" TEXT,
    "noHp" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "lokasi" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "kuota" INTEGER NOT NULL,
    "gambar" TEXT,
    "status" "StatusEvent" NOT NULL DEFAULT 'UPCOMING',
    "adminId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pendaftaran" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "status" "StatusPendaftaran" NOT NULL DEFAULT 'PENDING',
    "motivasi" TEXT NOT NULL,
    "kesehatan" JSONB NOT NULL,
    "izin" BOOLEAN NOT NULL DEFAULT false,
    "nik" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "tanggalLahir" TIMESTAMP(3) NOT NULL,
    "noHp" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pendaftaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dokumentasi" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fotoUrl" TEXT NOT NULL,
    "caption" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dokumentasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sampah" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "jenis" TEXT NOT NULL,
    "jumlahKg" DOUBLE PRECISION NOT NULL,
    "catatan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sampah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sertifikat" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "pendaftaranId" TEXT NOT NULL,
    "nomorSertifikat" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sertifikat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "pendaftaran_userId_eventId_key" ON "pendaftaran"("userId", "eventId");

-- CreateIndex
CREATE UNIQUE INDEX "sertifikat_pendaftaranId_key" ON "sertifikat"("pendaftaranId");

-- CreateIndex
CREATE UNIQUE INDEX "sertifikat_nomorSertifikat_key" ON "sertifikat"("nomorSertifikat");

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pendaftaran" ADD CONSTRAINT "pendaftaran_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pendaftaran" ADD CONSTRAINT "pendaftaran_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dokumentasi" ADD CONSTRAINT "dokumentasi_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dokumentasi" ADD CONSTRAINT "dokumentasi_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sampah" ADD CONSTRAINT "sampah_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sertifikat" ADD CONSTRAINT "sertifikat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sertifikat" ADD CONSTRAINT "sertifikat_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sertifikat" ADD CONSTRAINT "sertifikat_pendaftaranId_fkey" FOREIGN KEY ("pendaftaranId") REFERENCES "pendaftaran"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
