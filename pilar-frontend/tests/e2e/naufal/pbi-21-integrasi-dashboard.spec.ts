/**
 * PBI #21 — Integrasi Statistik ke Dashboard
 * "Sebagai admin, saya ingin mengintegrasikan statistik ke dashboard agar informasi terpusat."
 *
 * Strategi:
 *   TC.001 -> Admin akses halaman Laporan (/dashboard/admin/laporan).
 *             Mock /api/laporan untuk memastikan daftar event memuat ringkasan
 *             (_count pendaftaran & sampah).
 *   TC.002 -> Navigasi empty state jika belum ada laporan.
 */
import { test, expect } from '@playwright/test';
import { loginViaAPI, setAuthInBrowser } from '../helpers/auth';

const ADMIN_EMAIL    = process.env.TEST_ADMIN_EMAIL    ?? 'admin@pilar.id';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD ?? 'admin123';

test.describe('[PBI #21] Integrasi Statistik ke Dashboard (Laporan)', () => {

  // ──────────────────────────────────────────────────────────────────────────
  // TC.IntegrasiStatistik.001 — Positif (Data Tersedia)
  // ──────────────────────────────────────────────────────────────────────────
  test('[TC.IntegrasiStatistik.001] Admin melihat ringkasan statistik per event di halaman laporan', async ({
    page,
    request,
  }) => {
    const { token, user } = await loginViaAPI(request, ADMIN_EMAIL, ADMIN_PASSWORD);

    await page.goto('/');
    await setAuthInBrowser(page, token, user);

    const mockEventLaporan = [
      {
        id: 'evt-laporan-1',
        judul: 'Bersih Pantai Ancol',
        tanggal: '2026-06-15T08:00:00.000Z',
        lokasi: 'Pantai Ancol, Jakarta',
        _count: {
          pendaftaran: 125,
          sampah: 8, // 8 record sampah
          dokumentasi: 12
        }
      }
    ];

    // Mock GET /laporan
    await page.route(
      (url) => url.pathname === '/api/laporan',
      (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockEventLaporan),
        }),
    );

    await page.goto('/dashboard/admin/laporan');
    await page.waitForLoadState('networkidle');

    // Cari container laporan untuk event spesifik untuk memastikan statistik berada dalam konteks yang benar.
    const reportItem = page.locator('div').filter({ hasText: 'Bersih Pantai Ancol' }).first();
    await expect(reportItem).toBeVisible({ timeout: 8_000 });

    // Memastikan angka statistik yang diintegrasikan muncul (sesuai README format X relawan, Y foto)
    // Assertion di-scope ke dalam container `reportItem` untuk menghindari ambiguitas.
    await expect(reportItem.getByText('125 relawan')).toBeVisible();
    await expect(reportItem.getByText('12 foto')).toBeVisible();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TC.IntegrasiStatistik.002 — Positif (Empty State)
  // ──────────────────────────────────────────────────────────────────────────
  test('[TC.IntegrasiStatistik.002] Tampilan empty state jika tidak ada data laporan', async ({
    page,
    request,
  }) => {
    const { token, user } = await loginViaAPI(request, ADMIN_EMAIL, ADMIN_PASSWORD);

    await page.goto('/');
    await setAuthInBrowser(page, token, user);

    // Mock GET /laporan dengan array kosong
    await page.route(
      (url) => url.pathname === '/api/laporan',
      (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        }),
    );

    await page.goto('/dashboard/admin/laporan');
    await page.waitForLoadState('networkidle');

    // Assertions empty state
    await expect(page.getByText('Tidak ada data', { exact: false })).toBeVisible({ timeout: 8_000 });
  });
});