import { test, expect } from '@playwright/test';
import { loginViaAPI, setAuthInBrowser } from '../helpers/auth';

const ADMIN_EMAIL    = process.env.TEST_ADMIN_EMAIL    ?? 'admin@pilar.id';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD ?? 'admin123';

const MOCK_STATS = {
  totalEvent: 5,
  totalRelawan: 42,
  totalSampahKg: 320,
  sampahPerJenis: [
    { jenis: 'Plastik', totalKg: 150 },
    { jenis: 'Logam',   totalKg: 80 },
    { jenis: 'Organik', totalKg: 60 },
    { jenis: 'Kaca',    totalKg: 30 },
  ],
};

test.describe('[PBI #22] Statistik Sampah Terpilah Dashboard Admin', () => {

  test('[TC.SampahTerpilah.001] Kartu Sampah Terkumpul tampil di dashboard admin', async ({
    page,
    request,
  }) => {
    const { token, user } = await loginViaAPI(request, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.goto('/');
    await setAuthInBrowser(page, token, user);

    await page.route(
      (url) => url.pathname === '/api/events/stats',
      (route) => route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_STATS),
      }),
    );
    await page.route(
      (url) => url.pathname === '/api/events',
      (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) }),
    );

    await page.goto('/dashboard/admin');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Dashboard Administrator')).toBeVisible({ timeout: 8_000 });

    // Kartu "Sampah Terkumpul" harus ada
    const sampahCard = page.locator('.admin-stat').filter({ hasText: 'Sampah Terkumpul' });
    await expect(sampahCard).toBeVisible();
    await expect(sampahCard).toContainText('320');
  });

  test('[TC.SampahTerpilah.002] Rincian sampah per jenis tampil dengan label jenis yang benar', async ({
    page,
    request,
  }) => {
    const { token, user } = await loginViaAPI(request, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.goto('/');
    await setAuthInBrowser(page, token, user);

    await page.route(
      (url) => url.pathname === '/api/events/stats',
      (route) => route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_STATS),
      }),
    );
    await page.route(
      (url) => url.pathname === '/api/events',
      (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) }),
    );

    await page.goto('/dashboard/admin');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Dashboard Administrator')).toBeVisible({ timeout: 8_000 });

    // Bagian "Komposisi Sampah per Jenis" harus ada
    await expect(page.getByText('Komposisi Sampah per Jenis')).toBeVisible();

    // Setiap jenis dari mock harus tampil
    for (const s of MOCK_STATS.sampahPerJenis) {
      await expect(page.getByText(s.jenis).first()).toBeVisible();
    }
  });
});
