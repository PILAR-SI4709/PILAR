/**
 * PBI #2 — Login
 * "Sebagai pengguna terdaftar, saya ingin masuk ke akun agar dapat menggunakan fitur PILAR."
 *
 * Referensi: README-TestPlan.md — section 4.1 (Alur Login) & section 5 (Selectors)
 *
 * Selectors yang dipakai (dari README-TestPlan.md section 5):
 *   .login-input  → input email & password
 *   .login-btn    → tombol submit "Masuk"
 */
import { test, expect } from '@playwright/test';

// ── Credentials dari .env.test ──────────────────────────────────────────────
const RELAWAN_EMAIL    = process.env.TEST_RELAWAN_EMAIL    ?? 'relawan@pilar.id';
const RELAWAN_PASSWORD = process.env.TEST_RELAWAN_PASSWORD ?? 'relawan123';

test.describe('[PBI #2] Login', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TC.Login.001 — Positif
  // Login dengan email dan password yang benar.
  // ──────────────────────────────────────────────────────────────────────────
  test('[TC.Login.001] Login dengan kredensial valid', async ({ page }) => {
    // Isi form login dengan kredensial relawan yang valid
    await page.locator('input[type="email"].login-input').fill(RELAWAN_EMAIL);
    await page.locator('input[type="password"].login-input').fill(RELAWAN_PASSWORD);
    await page.locator('.login-btn').click();

    // ── Assertions ──────────────────────────────────────────────────────────
    // 1. Toast "Selamat datang, {nama}!" muncul setelah login berhasil
    await expect(page.getByText(/Selamat datang/i)).toBeVisible({
      timeout: 10_000,
    });

    // 2. User di-redirect ke homepage (/)
    //    (Login handler: setTimeout 600ms → window.location.href = '/')
    await page.waitForURL((url) => url.pathname === '/', { timeout: 10_000 });

    // 3. Token JWT tersimpan di localStorage key 'pilar_token'
    const savedToken = await page.evaluate(() => localStorage.getItem('pilar_token'));
    expect(savedToken).not.toBeNull();
    expect(savedToken!.split('.').length).toBe(3); // format JWT: header.payload.signature

    // 4. User object tersimpan di localStorage key 'pilar_user'
    const savedUser = await page.evaluate(() => localStorage.getItem('pilar_user'));
    expect(savedUser).not.toBeNull();
    const parsedUser = JSON.parse(savedUser!);
    expect(parsedUser.email).toBe(RELAWAN_EMAIL);
    expect(parsedUser.role).toBe('USER');
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TC.Login.002 — Negatif
  // Login dengan password yang salah.
  // ──────────────────────────────────────────────────────────────────────────
  test('[TC.Login.002] Login dengan password salah', async ({ page }) => {
    await page.locator('input[type="email"].login-input').fill(RELAWAN_EMAIL);
    await page.locator('input[type="password"].login-input').fill('salah999');
    await page.locator('.login-btn').click();

    // ── Assertions ──────────────────────────────────────────────────────────
    // 1. Toast error muncul mengandung "password salah"
    //    (Backend 401: "Email atau password salah")
    await expect(page.getByText(/password salah/i)).toBeVisible({
      timeout: 8_000,
    });

    // 2. Tidak ada redirect — user tetap di /login
    expect(page.url()).toContain('/login');

    // 3. Token TIDAK tersimpan di localStorage
    const savedToken = await page.evaluate(() => localStorage.getItem('pilar_token'));
    expect(savedToken).toBeNull();
  });
});
