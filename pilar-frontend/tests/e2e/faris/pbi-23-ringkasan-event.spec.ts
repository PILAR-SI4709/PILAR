import { test, expect } from '@playwright/test';
import { loginViaAPI, setAuthInBrowser } from '../helpers/auth';

const ADMIN_EMAIL    = process.env.TEST_ADMIN_EMAIL    ?? 'admin@pilar.id';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD ?? 'admin123';

const MOCK_EVENTS = [
  {
    id: 'mock-ev-f23-001',
    judul: 'Bersih Pantai Test Faris 23',
    lokasi: 'Pantai Ancol Test',
    tanggal: '2026-08-10T07:00:00.000Z',
    kuota: 30,
    status: 'UPCOMING',
    _count: { pendaftaran: 5 },
  },
];

const MOCK_STATS = { totalEvent: 1, totalRelawan: 5, totalSampahKg: 0, sampahPerJenis: [] };

test.describe('[PBI #23] Ringkasan Laporan Kegiatan di Dashboard Admin', () => {

  test('[TC.RingkasanEvent.001] Tabel "Semua Event" tampil dengan kolom yang benar', async ({
    page,
    request,
  }) => {
    const { token, user } = await loginViaAPI(request, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.goto('/');
    await setAuthInBrowser(page, token, user);

    await page.route(
      (url) => url.pathname === '/api/events/stats',
      (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_STATS) }),
    );
    await page.route(
      (url) => url.pathname === '/api/events',
      (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_EVENTS) }),
    );

    await page.goto('/dashboard/admin');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Dashboard Administrator')).toBeVisible({ timeout: 8_000 });

    // Header tabel "Semua Event"
    await expect(page.getByText('Semua Event')).toBeVisible();

    // Kolom-kolom header tabel
    const expectedColumns = ['Event', 'Tanggal', 'Relawan', 'Status', 'Aksi'];
    for (const col of expectedColumns) {
      await expect(page.getByRole('columnheader', { name: col })).toBeVisible();
    }

    // Baris event dari mock tampil
    await expect(page.getByText(MOCK_EVENTS[0].judul)).toBeVisible();
  });

  test('[TC.RingkasanEvent.002] Tautan "Kelola semua" mengarah ke halaman kelola event', async ({
    page,
    request,
  }) => {
    const { token, user } = await loginViaAPI(request, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.goto('/');
    await setAuthInBrowser(page, token, user);

    await page.route(
      (url) => url.pathname === '/api/events/stats',
      (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_STATS) }),
    );
    await page.route(
      (url) => url.pathname === '/api/events',
      (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_EVENTS) }),
    );

    await page.goto('/dashboard/admin');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Dashboard Administrator')).toBeVisible({ timeout: 8_000 });

    // Klik "Kelola semua" → harus menuju /dashboard/admin/events
    const link = page.getByRole('link', { name: 'Kelola semua' });
    await expect(link).toBeVisible();
    await link.click();
    await page.waitForURL((url) => url.pathname === '/dashboard/admin/events', { timeout: 8_000 });
    expect(page.url()).toContain('/dashboard/admin/events');
  });
});
