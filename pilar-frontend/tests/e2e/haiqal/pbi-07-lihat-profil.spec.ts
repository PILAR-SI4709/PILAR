/**
 * PBI #7 — Lihat Profil Relawan
 * "Sebagai relawan, saya ingin melihat profil saya agar dapat memastikan data akun saya benar."
 *
 * Referensi: README-TestPlan.md — section 4.5 (Profil) & section 5 (Selectors)
 *
 * Strategi:
 *   TC.001 → Inject token relawan, akses /profile, bandingkan nama/email/stats dengan API
 *   TC.002 → page.route() paksa 401 pada /users/profile → interceptor redirect ke /login
 */
import { test, expect } from '@playwright/test';
import { loginViaAPI, setAuthInBrowser } from '../helpers/auth';

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:3001/api';

const RELAWAN_EMAIL    = process.env.TEST_RELAWAN_EMAIL    ?? 'relawan@pilar.id';
const RELAWAN_PASSWORD = process.env.TEST_RELAWAN_PASSWORD ?? 'relawan123';

test.describe('[PBI #7] Lihat Profil Relawan', () => {

  // ──────────────────────────────────────────────────────────────────────────
  // TC.LihatProfil.001 — Positif
  // Halaman /profile menampilkan nama, email, dan stat card sesuai data API.
  // ──────────────────────────────────────────────────────────────────────────
  test('[TC.LihatProfil.001] Halaman profil menampilkan data user yang benar', async ({
    page,
    request,
  }) => {
    // Setup: login relawan, inject token ke browser
    const { token, user } = await loginViaAPI(request, RELAWAN_EMAIL, RELAWAN_PASSWORD);
    await page.goto('/');
    await setAuthInBrowser(page, token, user);

    // Ambil data profil & stats dari API sebagai ground truth
    const [profileRes, statsRes] = await Promise.all([
      request.get(`${API_BASE}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      request.get(`${API_BASE}/users/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);
    expect(profileRes.ok()).toBeTruthy();
    expect(statsRes.ok()).toBeTruthy();
    const profile = await profileRes.json();
    const stats   = await statsRes.json();

    // Navigasi ke /profile
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    // ── Assertions ──────────────────────────────────────────────────────────
    // 1. Nama dan email user tampil di halaman
    //    Gunakan .first() karena nama bisa muncul di beberapa tempat (sidebar, card)
    await expect(page.getByText(profile.nama).first()).toBeVisible({ timeout: 8_000 });
    await expect(page.getByText(profile.email).first()).toBeVisible();

    // 2. Stat card 'Event Diikuti' tampil dengan nilai sesuai API
    const statEventCard = page.locator('.prof-stat').filter({ hasText: 'Event Diikuti' });
    await expect(statEventCard).toBeVisible();
    await expect(statEventCard).toContainText(String(stats.totalEvent));

    // 3. Stat card 'Sampah (kg)' tampil dengan nilai sesuai API
    const statSampahCard = page.locator('.prof-stat').filter({ hasText: 'Sampah (kg)' });
    await expect(statSampahCard).toBeVisible();
    await expect(statSampahCard).toContainText(String(stats.totalSampahKg));

    // 4. Section 'Informasi Profil' tampil (form info)
    await expect(page.getByText('Informasi Profil')).toBeVisible();

    // 5. Tidak ada pesan error di halaman
    await expect(page.getByText(/terjadi kesalahan/i)).not.toBeVisible();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TC.LihatProfil.002 — Negatif
  // Akses /profile tanpa sesi → interceptor 401 → redirect ke /login.
  //
  // Gunakan page.route() agar deterministik: /users/profile selalu return 401,
  // sehingga interceptor axios pasti memicu redirect ke /login tanpa bergantung
  // pada state backend.
  // ──────────────────────────────────────────────────────────────────────────
  test('[TC.LihatProfil.002] Akses /profile tanpa login redirect ke /login', async ({
    page,
  }) => {
    // Intercept /users/profile — paksa selalu 401
    await page.route('**/api/users/profile', (route) =>
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Unauthorized', statusCode: 401 }),
      }),
    );

    // Navigasi ke /profile tanpa token
    // Promise.all: waitForURL aktif sebelum goto agar redirect tidak terlewat.
    // page.goto() di-catch karena interceptor yang set window.location.href='/login'
    // akan meng-abort navigasi ke /profile → Playwright melempar ERR_ABORTED.
    await Promise.all([
      page.waitForURL((url) => url.pathname.includes('/login'), { timeout: 15_000 }),
      page.goto('/profile').catch((err: Error) => {
        if (err.message?.includes('ERR_ABORTED')) return;
        throw err;
      }),
    ]);

    // ── Assertions ──────────────────────────────────────────────────────────
    // 1. URL akhir mengandung /login
    expect(page.url()).toContain('/login');

    // 2. Form login tersedia (bisa login kembali)
    await expect(page.locator('.login-input').first()).toBeVisible();

    // 3. Data profil user TIDAK tampil
    await expect(page.getByText('Informasi Profil')).not.toBeVisible();
  });
});
