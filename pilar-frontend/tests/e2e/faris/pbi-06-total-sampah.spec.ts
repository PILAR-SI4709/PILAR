/**
 * PBI #6 — Total Sampah Dashboard Admin
 * "Sebagai admin, saya ingin melihat total sampah terkumpul di dashboard agar dapat
 *  memantau dampak lingkungan dari kegiatan bersih pantai."
 *
 * Referensi: README-TestPlan.md — section 4.4 (Dashboard Admin) & section 5 (Selectors)
 *
 * Strategi:
 *   TC.001 → Inject token admin, ambil GET /events/stats, bandingkan totalSampahKg dengan stat card
 *   TC.002 → Inject token admin, cek stat card tampil dengan angka valid (≥ 0) dan unit 'kg' tanpa crash
 *
 * Catatan format angka:
 *   UI merender nilai sebagai `${totalSampahKg.toLocaleString("id-ID")} kg`
 *   (contoh: 1500 → "1.500 kg", 0 → "0 kg")
 *   Untuk menghindari perbedaan locale antara Node.js dan Chromium, nilai numerik
 *   diekstrak dari teks UI dan dibandingkan sebagai integer.
 */
import { test, expect } from '@playwright/test';
import { loginViaAPI, setAuthInBrowser } from '../helpers/auth';

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:3001/api';

const ADMIN_EMAIL    = process.env.TEST_ADMIN_EMAIL    ?? 'admin@pilar.id';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD ?? 'admin123';

test.describe('[PBI #6] Total Sampah Dashboard Admin', () => {

  // ────────────────────────────────────────────────────────────────────────────
  // TC.TotalSampah.001 — Positif
  // Stat card Sampah Terkumpul menampilkan angka yang sesuai dengan response API.
  // ────────────────────────────────────────────────────────────────────────────
  test('[TC.TotalSampah.001] Stat card Sampah Terkumpul sesuai dengan data API', async ({
    page,
    request,
  }) => {
    // Setup: login sebagai admin, inject token ke browser
    const { token, user } = await loginViaAPI(request, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.goto('/');
    await setAuthInBrowser(page, token, user);

    // Ambil nilai stats langsung dari API sebagai ground truth
    const statsRes = await request.get(`${API_BASE}/events/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(statsRes.ok()).toBeTruthy();
    const stats = await statsRes.json();

    // Navigasi ke dashboard admin
    await page.goto('/dashboard/admin');
    await page.waitForLoadState('networkidle');

    // Pastikan halaman admin berhasil dimuat
    await expect(page.getByText('Dashboard Administrator')).toBeVisible({ timeout: 8_000 });

    // Cari stat card dengan label 'Sampah Terkumpul'
    const statCard = page.locator('.admin-stat').filter({ hasText: 'Sampah Terkumpul' });
    await expect(statCard).toBeVisible();

    // ── Assertions ──────────────────────────────────────────────────────────
    // 1. Stat card menampilkan unit 'kg'
    await expect(statCard).toContainText('kg');

    // 2. Nilai numerik di stat card sesuai dengan data API
    //    Ekstrak angka dari format "X.XXX kg" (locale id-ID menggunakan '.' sebagai
    //    pemisah ribuan), lalu bandingkan sebagai integer dengan nilai API.
    const cardText = await statCard.textContent() ?? '';
    const rawNumStr = cardText.match(/[\d.]+(?=\s*kg)/)?.[0] ?? '0';
    const displayedNum = parseInt(rawNumStr.replace(/\./g, ''), 10);
    expect(displayedNum).toBe(stats.totalSampahKg);

    // 3. Halaman tidak menampilkan pesan error
    await expect(page.getByText(/terjadi kesalahan/i)).not.toBeVisible();
  });

  // ────────────────────────────────────────────────────────────────────────────
  // TC.TotalSampah.002 — Negatif
  // Stat card Sampah Terkumpul tetap tampil tanpa crash saat belum ada data sampah
  // (totalSampahKg = 0 dari database).
  // ────────────────────────────────────────────────────────────────────────────
  test('[TC.TotalSampah.002] Stat card Sampah Terkumpul tampil valid saat belum ada data', async ({
    page,
    request,
  }) => {
    // Setup: login sebagai admin, inject token ke browser
    const { token, user } = await loginViaAPI(request, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.goto('/');
    await setAuthInBrowser(page, token, user);

    // Navigasi ke dashboard admin
    await page.goto('/dashboard/admin');
    await page.waitForLoadState('networkidle');

    // Pastikan halaman admin berhasil dimuat
    await expect(page.getByText('Dashboard Administrator')).toBeVisible({ timeout: 8_000 });

    // Cari stat card dengan label 'Sampah Terkumpul'
    const statCard = page.locator('.admin-stat').filter({ hasText: 'Sampah Terkumpul' });
    await expect(statCard).toBeVisible();

    // ── Assertions ──────────────────────────────────────────────────────────
    // 1. Stat card tampil tanpa crash — tidak ada pesan error di halaman
    await expect(page.getByText(/terjadi kesalahan/i)).not.toBeVisible();

    // 2. Stat card menampilkan angka valid diikuti unit 'kg'
    //    Regex: satu atau lebih digit (dengan opsional pemisah ribuan), diikuti ' kg'
    await expect(statCard).toContainText(/[\d.,]+ kg/);

    // 3. Nilai numerik adalah angka valid (≥ 0)
    const cardText = await statCard.textContent() ?? '';
    const rawNumStr = cardText.match(/[\d.]+(?=\s*kg)/)?.[0] ?? '0';
    const displayedNum = parseInt(rawNumStr.replace(/\./g, ''), 10);
    expect(displayedNum).toBeGreaterThanOrEqual(0);
  });
});
