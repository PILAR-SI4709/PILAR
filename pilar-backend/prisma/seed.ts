/**
 * Seed script untuk membuat akun test di database.
 * Dijalankan dengan: npx ts-node prisma/seed.ts
 *
 * Akun yang dibuat:
 *   admin@pilar.id  / admin123  — role ADMIN
 *   relawan@pilar.id / relawan123 — role USER
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const accounts = [
    {
      nama: 'Administrator',
      email: 'admin@pilar.id',
      password: 'admin123',
      role: 'ADMIN' as const,
    },
    {
      nama: 'Relawan',
      email: 'relawan@pilar.id',
      password: 'relawan123',
      role: 'USER' as const,
    },
  ];

  for (const account of accounts) {
    const hashed = await bcrypt.hash(account.password, 10);
    const user = await prisma.user.upsert({
      where: { email: account.email },
      update: { password: hashed, role: account.role, nama: account.nama },
      create: {
        nama: account.nama,
        email: account.email,
        password: hashed,
        role: account.role,
      },
    });
    console.log(`✓ ${user.role.padEnd(5)} ${user.email}`);
  }

  console.log('\nSeed selesai. Akun test siap digunakan.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
