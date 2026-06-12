-- TASK 7: Preferensi notifikasi email pada User
ALTER TABLE "users" ADD COLUMN     "emailNotificationEnabled" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "users" ADD COLUMN     "reminderNotificationEnabled" BOOLEAN NOT NULL DEFAULT true;

-- TASK 6: Detail kegiatan yang bisa diisi admin pada Event
ALTER TABLE "events" ADD COLUMN     "tugasRelawan" TEXT;
ALTER TABLE "events" ADD COLUMN     "kriteriaRelawan" TEXT;
ALTER TABLE "events" ADD COLUMN     "perlengkapan" TEXT;
ALTER TABLE "events" ADD COLUMN     "domisili" TEXT;

-- TASK 4: Auto-reject berdasarkan form kesehatan pada Pendaftaran
ALTER TABLE "pendaftaran" ADD COLUMN     "autoRejected" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "pendaftaran" ADD COLUMN     "alasanReject" TEXT;
