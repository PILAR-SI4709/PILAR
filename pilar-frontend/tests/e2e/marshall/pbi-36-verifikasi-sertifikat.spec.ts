import { test, expect } from '@playwright/test';

// PBI #36 — GUEST (tanpa login)

const MOCK_EVENTS = [];
const MOCK_STATS = { totalEvent: 0, totalRelawan: 0, totalSampahKg: 0 };

const VALID_NOMOR    = 'PILAR-2026-VALID-001';
const INVALID_NOMOR  = 'PILAR-TIDAK-ADA-999';

const MOCK_SERTIFIKAT_RESULT = {
  nomorSertifikat: VALID_NOMOR,
  issuedAt: '2026-06-01T00:00:00.000Z',
  user: { nama: 'Relawan Verifikasi Test' },
  event: {
    judul: 'Bersih Pantai Verifikasi',
    tanggal: '2026-05-15T07:00:00.000Z',
    lokasi: 'Pantai Verifikasi',
  },
};

test.describe('[PBI #36] Verifikasi Keaslian Sertifikat oleh Guest', () => {

  test.beforeEach(async ({ page }) => {
    // Mock events & stats agar halaman landing termuat tanpa backend
    await page.route(
      (url) => url.pathname === '/api/events',
      (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_EVENTS) }),
    );
    await page.route(
      (url) => url.pathname === '/api/events/stats',
      (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_STATS) }),
    );
  });

  test('[TC.VerifSert.001] Nomor sertifikat valid menampilkan data sertifikat', async ({ page }) => {
    // Mock endpoint verifikasi untuk nomor valid
    await page.route(
      (url) => url.pathname === `/api/sertifikat/verifikasi/${VALID_NOMOR}`,
      (route) => route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_SERTIFIKAT_RESULT),
      }),
    );

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Scroll ke section verifikasi
    await page.locator('#verifikasi').scrollIntoViewIfNeeded();

    // Input "Masukkan nomor sertifikat" harus ada
    const input = page.getByPlaceholder('Masukkan nomor sertifikat');
    await expect(input).toBeVisible({ timeout: 8_000 });

    // Isi nomor valid dan klik Verifikasi
    await input.fill(VALID_NOMOR);
    await page.getByRole('button', { name: 'Verifikasi' }).click();

    // Data sertifikat harus muncul (nama relawan atau judul event)
    await expect(page.getByText(MOCK_SERTIFIKAT_RESULT.user.nama)).toBeVisible({ timeout: 8_000 });
    await expect(page.getByText(MOCK_SERTIFIKAT_RESULT.event.judul)).toBeVisible();
  });

  test('[TC.VerifSert.002] Nomor sertifikat tidak valid menampilkan pesan "Sertifikat tidak ditemukan"', async ({
    page,
  }) => {
    // Mock endpoint verifikasi untuk nomor tidak valid → 404
    await page.route(
      (url) => url.pathname === `/api/sertifikat/verifikasi/${INVALID_NOMOR}`,
      (route) => route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ message: 'Not found' }) }),
    );

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.locator('#verifikasi').scrollIntoViewIfNeeded();

    const input = page.getByPlaceholder('Masukkan nomor sertifikat');
    await expect(input).toBeVisible({ timeout: 8_000 });

    await input.fill(INVALID_NOMOR);
    await page.getByRole('button', { name: 'Verifikasi' }).click();

    // Pesan error harus tampil
    await expect(page.getByText('Sertifikat tidak ditemukan')).toBeVisible({ timeout: 8_000 });
  });
});
