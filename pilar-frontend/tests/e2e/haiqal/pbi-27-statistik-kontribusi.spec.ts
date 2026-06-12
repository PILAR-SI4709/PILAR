import { test, expect } from '@playwright/test';
import { loginViaAPI, setAuthInBrowser } from '../helpers/auth';

const RELAWAN_EMAIL    = process.env.TEST_RELAWAN_EMAIL    ?? 'relawan@pilar.id';
const RELAWAN_PASSWORD = process.env.TEST_RELAWAN_PASSWORD ?? 'relawan123';

const MOCK_PROFILE = {
  id: 'relawan-id',
  nama: 'Relawan Test',
  email: RELAWAN_EMAIL,
  role: 'USER',
  emailNotificationEnabled: true,
  reminderNotificationEnabled: true,
};

const MOCK_STATS = { totalEvent: 7, totalSampahKg: 45 };

test.describe('[PBI #27] Statistik Kontribusi Relawan di Halaman Profil', () => {

  test('[TC.StatKontribusi.001] Halaman /profile menampilkan label "Event Diikuti" dan "Sampah (kg)"', async ({
    page,
    request,
  }) => {
    const { token, user } = await loginViaAPI(request, RELAWAN_EMAIL, RELAWAN_PASSWORD);
    await page.goto('/');
    await setAuthInBrowser(page, token, user);

    await page.route(
      (url) => url.pathname === '/api/users/profile',
      (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_PROFILE) }),
    );
    await page.route(
      (url) => url.pathname === '/api/users/stats',
      (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_STATS) }),
    );

    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Profil Saya')).toBeVisible({ timeout: 8_000 });

    // Label statistik harus tampil
    await expect(page.getByText('Event Diikuti')).toBeVisible();
    await expect(page.getByText('Sampah (kg)')).toBeVisible();
  });

  test('[TC.StatKontribusi.002] Nilai statistik sesuai dengan data dari API', async ({
    page,
    request,
  }) => {
    const { token, user } = await loginViaAPI(request, RELAWAN_EMAIL, RELAWAN_PASSWORD);
    await page.goto('/');
    await setAuthInBrowser(page, token, user);

    await page.route(
      (url) => url.pathname === '/api/users/profile',
      (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_PROFILE) }),
    );
    await page.route(
      (url) => url.pathname === '/api/users/stats',
      (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_STATS) }),
    );

    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Profil Saya')).toBeVisible({ timeout: 8_000 });

    // Nilai harus sesuai mock
    await expect(page.getByText(String(MOCK_STATS.totalEvent))).toBeVisible();
    await expect(page.getByText(String(MOCK_STATS.totalSampahKg))).toBeVisible();
  });
});