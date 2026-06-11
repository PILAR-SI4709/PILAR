/**
 * PBI #20 — Monitor Statistik
 * "Sebagai admin, saya ingin memonitor statistik agar dapat mengetahui aktivitas sistem."
 *
 * Strategi:
 *   TC.001 -> Admin akses dashboard. Mock /api/events/stats dengan data spesifik.
 *             Ekspektasi: 3 kartu statistik (Total Event, Total Relawan, Sampah Terkumpul)
 *             muncul dengan angka yang sesuai dari API.
 */
import { test, expect } from '@playwright/test';
import { loginViaAPI, setAuthInBrowser } from '../helpers/auth';

const ADMIN_EMAIL    = process.env.TEST_ADMIN_EMAIL    ?? 'admin@pilar.id';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD ?? 'admin123';
const RELAWAN_EMAIL    = process.env.TEST_RELAWAN_EMAIL    ?? 'relawan@pilar.id';
const RELAWAN_PASSWORD = process.env.TEST_RELAWAN_PASSWORD ?? 'relawan123';

test.describe('[PBI #20] Monitor Statistik', () => {

  // ──────────────────────────────────────────────────────────────────────────
  // TC.MonitorStatistik.001 — Positif
  // ──────────────────────────────────────────────────────────────────────────
  test('[TC.MonitorStatistik.001] Admin melihat statistik global di dashboard', async ({
    page,
    request,
  }) => {
    const { token, user } = await loginViaAPI(request, ADMIN_EMAIL, ADMIN_PASSWORD);

    await page.goto('/');
    await setAuthInBrowser(page, token, user);

    // Data mock statistik global
    const mockStats = {
      totalEvent: 42,
      totalRelawan: 1560,
      totalSampahKg: 850.5
    };

    // Mock GET /events/stats
    await page.route(
      (url) => url.pathname === '/api/events/stats',
      (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockStats),
        }),
    );

    // Navigasi ke dashboard admin
    await page.goto('/dashboard/admin');
    await page.waitForLoadState('networkidle');

    // Assertions judul dashboard
    await expect(page.getByRole('heading', { name: `Selamat datang, ${user.nama}` })).toBeVisible({ timeout: 8_000 });

    // Menggunakan selector `.admin-stat` dari README-TestPlan.md untuk robustness
    // dan men-scope assertion angka ke dalam kartu yang benar.
    const totalEventCard = page.locator('.admin-stat', { hasText: 'Total Event' });
    await expect(totalEventCard).toBeVisible();
    await expect(totalEventCard.getByText(mockStats.totalEvent.toString())).toBeVisible();

    const totalRelawanCard = page.locator('.admin-stat', { hasText: 'Total Relawan' });
    await expect(totalRelawanCard).toBeVisible();
    await expect(totalRelawanCard.getByText(mockStats.totalRelawan.toString())).toBeVisible();

    const sampahCard = page.locator('.admin-stat', { hasText: 'Sampah Terkumpul' });
    await expect(sampahCard).toBeVisible();
    // Disesuaikan dengan format UI lokal Indonesia + satuan (contoh: 850,5 kg)
    await expect(sampahCard.getByText('850,5 kg')).toBeVisible();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TC.StatDashboard.002 — Negatif (Akses Ditolak)
  // ──────────────────────────────────────────────────────────────────────────
  test('[TC.StatDashboard.002] Menguji statistik dashboard tidak dapat diakses relawan', async ({
    page,
    request,
  }) => {
    const { token, user } = await loginViaAPI(request, RELAWAN_EMAIL, RELAWAN_PASSWORD);

    await page.goto('/');
    await setAuthInBrowser(page, token, user);

    // Navigasi ke dashboard admin menggunakan akun relawan
    await page.goto('/dashboard/admin');

    // Ekspektasi: Terjadi redirect ke /dashboard (tidak boleh mengakses rute admin)
    await expect(page).toHaveURL(/.*\/dashboard$/);
    await expect(page).not.toHaveURL(/.*\/dashboard\/admin/);
  });
});