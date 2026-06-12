import { test, expect } from '@playwright/test';

// PBI #30 — GUEST (tanpa login)

const MOCK_EVENTS = [
  {
    id: 'ev-s30-001',
    judul: 'Bersih Pantai Ancol',
    lokasi: 'Pantai Ancol, Jakarta Utara',
    tanggal: '2026-09-01T07:00:00.000Z',
    kuota: 50,
    status: 'UPCOMING',
    _count: { pendaftaran: 10 },
  },
  {
    id: 'ev-s30-002',
    judul: 'Aksi Pantai Parangtritis',
    lokasi: 'Parangtritis, Yogyakarta',
    tanggal: '2026-08-15T07:00:00.000Z',
    kuota: 40,
    status: 'ONGOING',
    _count: { pendaftaran: 40 },
  },
  {
    id: 'ev-s30-003',
    judul: 'Clean Up Pantai Kuta',
    lokasi: 'Pantai Kuta, Bali',
    tanggal: '2026-07-01T07:00:00.000Z',
    kuota: 60,
    status: 'DONE',
    _count: { pendaftaran: 60 },
  },
];

const MOCK_STATS = { totalEvent: 3, totalRelawan: 110, totalSampahKg: 500 };

test.describe('[PBI #30] Pencarian dan Filter Event di Landing Page', () => {

  test.beforeEach(async ({ page }) => {
    // Mock API agar test berjalan tanpa backend
    await page.route(
      (url) => url.pathname === '/api/events',
      (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_EVENTS) }),
    );
    await page.route(
      (url) => url.pathname === '/api/events/stats',
      (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_STATS) }),
    );
  });

  test('[TC.CariEvent.001] Mengetik kata kunci di kolom pencarian menyaring daftar event', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Scroll ke bagian event
    await page.locator('#events').scrollIntoViewIfNeeded();

    // Input pencarian harus ada
    const searchInput = page.getByPlaceholder('Cari event...');
    await expect(searchInput).toBeVisible({ timeout: 8_000 });

    // Ketik kata kunci yang hanya cocok dengan 1 event
    await searchInput.fill('Ancol');

    // Event yang cocok tampil
    await expect(page.getByText('Bersih Pantai Ancol')).toBeVisible();

    // Event yang tidak cocok tidak tampil
    await expect(page.getByText('Aksi Pantai Parangtritis')).not.toBeVisible();
    await expect(page.getByText('Clean Up Pantai Kuta')).not.toBeVisible();
  });

  test('[TC.CariEvent.002] Filter status menampilkan hanya event dengan status yang dipilih', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.locator('#events').scrollIntoViewIfNeeded();

    // Tunggu event cards muncul
    await expect(page.locator('.event-card-premium').first()).toBeVisible({ timeout: 8_000 });

    // Klik filter "Selesai"
    const filterSelesai = page.getByRole('button', { name: 'Selesai' }).last();
    await filterSelesai.click();

    // Hanya event DONE yang tampil
    await expect(page.getByText('Clean Up Pantai Kuta')).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText('Bersih Pantai Ancol')).not.toBeVisible();
    await expect(page.getByText('Aksi Pantai Parangtritis')).not.toBeVisible();
  });

  test('[TC.CariEvent.003] Menghapus pencarian mengembalikan semua event', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.locator('#events').scrollIntoViewIfNeeded();

    const searchInput = page.getByPlaceholder('Cari event...');
    await expect(searchInput).toBeVisible({ timeout: 8_000 });

    // Isi pencarian
    await searchInput.fill('Kuta');
    await expect(page.getByText('Clean Up Pantai Kuta')).toBeVisible();
    await expect(page.getByText('Bersih Pantai Ancol')).not.toBeVisible();

    // Kosongkan pencarian → semua event kembali tampil
    await searchInput.clear();
    await expect(page.getByText('Bersih Pantai Ancol')).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText('Aksi Pantai Parangtritis')).toBeVisible();
    await expect(page.getByText('Clean Up Pantai Kuta')).toBeVisible();
  });
});
