/**
 * PBI #3 — Logout
 * "Sebagai pengguna yang sudah login, saya ingin keluar dari akun agar sesi saya aman."
 *
 * Referensi: README-TestPlan.md — section 4.1 (Alur Logout) & section 5 (Selectors)
 *
 * Strategi:
 *   TC.001 → Inject token via API (setAuthInBrowser), lalu klik "Keluar" di Sidebar
 *   TC.002 → Akses /dashboard tanpa token → API 401 → interceptor redirect ke /login
 */
import { test, expect } from '@playwright/test';
import { loginViaAPI, setAuthInBrowser } from '../helpers/auth';

// ── Credentials dari .env.test ──────────────────────────────────────────────
const RELAWAN_EMAIL    = process.env.TEST_RELAWAN_EMAIL    ?? 'relawan@pilar.id';
const RELAWAN_PASSWORD = process.env.TEST_RELAWAN_PASSWORD ?? 'relawan123';

test.describe('[PBI #3] Logout', () => {

  // ──────────────────────────────────────────────────────────────────────────
  // TC.Logout.001 — Positif
  // Logout dari dashboard mengosongkan sesi pengguna.
  // ──────────────────────────────────────────────────────────────────────────
  test('[TC.Logout.001] Logout menghapus sesi dan redirect ke homepage', async ({
    page,
    request,
  }) => {
    // Setup: Login via API, inject token ke browser (lebih cepat dari UI login)
    const { token, user } = await loginViaAPI(request, RELAWAN_EMAIL, RELAWAN_PASSWORD);
    await page.goto('/');
    await setAuthInBrowser(page, token, user);

    // Navigasi ke dashboard (halaman yang membutuhkan auth)
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Pastikan halaman dashboard berhasil dimuat (Sidebar tampil)
    await expect(page.getByText('Keluar')).toBeVisible({ timeout: 8_000 });

    // Klik tombol "Keluar" di Sidebar
    await page.getByText('Keluar').click();

    // ── Assertions ──────────────────────────────────────────────────────────
    // 1. User di-redirect ke homepage (/)
    //    (Sidebar.handleLogout: logout() + window.location.href = '/')
    await page.waitForURL((url) => url.pathname === '/', { timeout: 10_000 });
    expect(page.url()).not.toContain('/dashboard');

    // 2. 'pilar_token' dihapus dari localStorage
    const savedToken = await page.evaluate(() => localStorage.getItem('pilar_token'));
    expect(savedToken).toBeNull();

    // 3. 'pilar_user' dihapus dari localStorage
    const savedUser = await page.evaluate(() => localStorage.getItem('pilar_user'));
    expect(savedUser).toBeNull();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TC.Logout.002 — Negatif
  // Mengakses halaman protected tanpa token harus di-redirect ke /login.
  //
  // Root cause kenapa test naif gagal:
  //   dashboard/page.tsx memiliki `catch {}` yang menelan SEMUA error termasuk
  //   network error (ECONNREFUSED). Axios interceptor hanya redirect ke /login
  //   jika `err.response?.status === 401` — jika backend tidak jalan atau request
  //   gagal di network level, kondisi ini tidak terpenuhi dan halaman tetap tampil.
  //
  // Solusi: gunakan page.route() untuk memastikan /pendaftaran/my selalu
  //   mengembalikan 401, sehingga interceptor pasti memicu redirect ke /login.
  // ──────────────────────────────────────────────────────────────────────────
  test('[TC.Logout.002] Akses halaman protected tanpa sesi redirect ke login', async ({
    page,
  }) => {
    // Intercept endpoint protected: paksa selalu return 401 Unauthorized.
    // Ini menggantikan ketergantungan pada backend yang sedang berjalan
    // dan menjamin kondisi "tidak ada sesi aktif" secara deterministik.
    await page.route('**/api/pendaftaran/my', (route) =>
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Unauthorized', statusCode: 401 }),
      }),
    );

    // Navigasi langsung ke halaman protected tanpa token
    // Promise.all menghindari race condition: waitForURL sudah aktif
    // sebelum goto selesai, sehingga redirect tidak terlewat.
    await Promise.all([
      page.waitForURL((url) => url.pathname.includes('/login'), { timeout: 15_000 }),
      page.goto('/dashboard'),
    ]);

    // ── Assertions ──────────────────────────────────────────────────────────
    // 1. URL akhir harus /login
    expect(page.url()).toContain('/login');

    // 2. Form login tersedia — user bisa login kembali
    await expect(page.locator('.login-input').first()).toBeVisible();

    // 3. Konten dashboard TIDAK tampil
    await expect(page.getByText('Dashboard Relawan')).not.toBeVisible();
    await expect(page.getByText('Dashboard Administrator')).not.toBeVisible();
  });
});
