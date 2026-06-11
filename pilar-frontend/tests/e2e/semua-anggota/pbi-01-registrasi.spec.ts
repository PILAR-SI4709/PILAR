/**
 * PBI #1 — Registrasi
 * "Sebagai pengguna baru, saya ingin mendaftarkan akun agar dapat mengakses platform PILAR."
 *
 * Referensi: README-TestPlan.md — section 4.1 (Alur Registrasi) & section 5 (Selectors)
 */
import { test, expect } from '@playwright/test';

// ── Credentials dari .env.test ──────────────────────────────────────────────
const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL ?? 'admin@pilar.id';

test.describe('[PBI #1] Registrasi', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TC.Registrasi.001 — Positif
  // Registrasi akun baru dengan data lengkap dan valid.
  // ──────────────────────────────────────────────────────────────────────────
  test('[TC.Registrasi.001] Registrasi dengan data valid', async ({ page }) => {
    // Gunakan email unik agar tidak konflik dengan data yang sudah ada
    const uniqueEmail = `test.reg.${Date.now()}@pilar.id`;

    // Isi form registrasi (.reg-input sesuai README-TestPlan.md section 5)
    await page.getByPlaceholder('Nama kamu').fill('Relawan Test Otomatis');
    await page.getByPlaceholder('email@kamu.com').fill(uniqueEmail);
    await page.getByPlaceholder('Min. 6 karakter').fill('test123');

    // Klik tombol "Buat Akun"
    await page.locator('.reg-btn').click();

    // ── Assertions ──────────────────────────────────────────────────────────
    // 1. Toast sukses harus muncul sebelum redirect
    await expect(page.getByText('Akun berhasil dibuat!')).toBeVisible({
      timeout: 10_000,
    });

    // 2. Setelah toast, user otomatis login dan di-redirect ke homepage
    await page.waitForURL((url) => url.pathname === '/', { timeout: 10_000 });

    // 3. Token tersimpan di localStorage — bukti user sudah login
    const savedToken = await page.evaluate(() => localStorage.getItem('pilar_token'));
    expect(savedToken).not.toBeNull();
    expect(savedToken).not.toBe('');

    // 4. Halaman menampilkan konten homepage (bukan halaman register)
    expect(page.url()).not.toContain('/register');
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TC.Registrasi.002 — Negatif
  // Registrasi menggunakan email yang sudah terdaftar di database.
  // ──────────────────────────────────────────────────────────────────────────
  test('[TC.Registrasi.002] Registrasi dengan email yang sudah terdaftar', async ({ page }) => {
    // Gunakan email admin yang sudah pasti ada di DB
    await page.getByPlaceholder('Nama kamu').fill('Duplikat Admin');
    await page.getByPlaceholder('email@kamu.com').fill(ADMIN_EMAIL);
    await page.getByPlaceholder('Min. 6 karakter').fill('test123');

    await page.locator('.reg-btn').click();

    // ── Assertions ──────────────────────────────────────────────────────────
    // 1. Toast error muncul dengan pesan mengandung "sudah terdaftar"
    //    (Backend mengembalikan: "Email sudah terdaftar" — ConflictException 409)
    await expect(page.getByText(/sudah terdaftar/i)).toBeVisible({
      timeout: 8_000,
    });

    // 2. User tetap berada di halaman /register — tidak ada redirect
    expect(page.url()).toContain('/register');

    // 3. Token TIDAK tersimpan (akun tidak dibuat)
    const savedToken = await page.evaluate(() => localStorage.getItem('pilar_token'));
    expect(savedToken).toBeNull();
  });
});
