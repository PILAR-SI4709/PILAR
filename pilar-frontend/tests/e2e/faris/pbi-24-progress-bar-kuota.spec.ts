import { test, expect } from '@playwright/test';
import { loginViaAPI, setAuthInBrowser } from '../helpers/auth';

const ADMIN_EMAIL    = process.env.TEST_ADMIN_EMAIL    ?? 'admin@pilar.id';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD ?? 'admin123';

const MOCK_EVENTS = [
  {
    id: 'mock-ev-f24-001',
    judul: 'Event Mendatang Test',
    lokasi: 'Pantai A',
    tanggal: '2026-09-01T07:00:00.000Z',
    kuota: 20,
    status: 'UPCOMING',
    _count: { pendaftaran: 10 },
  },
  {
    id: 'mock-ev-f24-002',
    judul: 'Event Berlangsung Test',
    lokasi: 'Pantai B',
    tanggal: '2026-08-01T07:00:00.000Z',
    kuota: 30,
    status: 'ONGOING',
    _count: { pendaftaran: 30 },
  },
  {
    id: 'mock-ev-f24-003',
    judul: 'Event Selesai Test',
    lokasi: 'Pantai C',
    tanggal: '2026-07-01T07:00:00.000Z',
    kuota: 15,
    status: 'DONE',
    _count: { pendaftaran: 15 },
  },
];

const MOCK_STATS = { totalEvent: 3, totalRelawan: 55, totalSampahKg: 120, sampahPerJenis: [] };

test.describe('[PBI #24] Progress Bar Kuota dan Badge Status di Dashboard Admin', () => {

  test('[TC.ProgressBar.001] Progress bar kuota dan badge status tampil di tabel event', async ({
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
    await expect(page.getByText('Semua Event')).toBeVisible();

    // Setiap baris event harus punya info kuota (format "X/Y")
    await expect(page.getByText('10/20')).toBeVisible();
    await expect(page.getByText('30/30')).toBeVisible();
    await expect(page.getByText('15/15')).toBeVisible();
  });

  test('[TC.ProgressBar.002] Badge status menampilkan label yang sesuai per status event', async ({
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

    // Badge status harus tampil untuk setiap event
    await expect(page.getByText('Mendatang').first()).toBeVisible();
    await expect(page.getByText('Berlangsung').first()).toBeVisible();
    await expect(page.getByText('Selesai').first()).toBeVisible();
  });
});
