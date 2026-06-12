-- DropForeignKey
ALTER TABLE "dokumentasi" DROP CONSTRAINT "dokumentasi_eventId_fkey";

-- DropForeignKey
ALTER TABLE "pendaftaran" DROP CONSTRAINT "pendaftaran_eventId_fkey";

-- DropForeignKey
ALTER TABLE "sampah" DROP CONSTRAINT "sampah_eventId_fkey";

-- DropForeignKey
ALTER TABLE "sertifikat" DROP CONSTRAINT "sertifikat_eventId_fkey";

-- DropForeignKey
ALTER TABLE "sertifikat" DROP CONSTRAINT "sertifikat_pendaftaranId_fkey";

-- AddForeignKey
ALTER TABLE "pendaftaran" ADD CONSTRAINT "pendaftaran_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dokumentasi" ADD CONSTRAINT "dokumentasi_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sampah" ADD CONSTRAINT "sampah_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sertifikat" ADD CONSTRAINT "sertifikat_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sertifikat" ADD CONSTRAINT "sertifikat_pendaftaranId_fkey" FOREIGN KEY ("pendaftaranId") REFERENCES "pendaftaran"("id") ON DELETE CASCADE ON UPDATE CASCADE;
