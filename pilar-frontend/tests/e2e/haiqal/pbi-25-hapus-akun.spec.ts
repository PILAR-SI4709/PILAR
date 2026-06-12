import { test, expect } from '@playwright/test';
import { loginViaAPI, setAuthInBrowser } from '../helpers/auth';

const RELAWAN_EMAIL    = process.env.TEST_RELAWAN_EMAIL    ?? 'relawan@pilar.id';
const RELAWAN_PASSWORD = process.env.TEST_RELAWAN_PASSWORD ?? 'relawan123';

test.describe('[PBI #25] Hapus Akun Relawan', () => {

  test('[TC.HapusAkun.001] Halaman settings menampilkan bagian Zona Bahaya dengan tombol hapus akun', async ({
    page,
    request,
  }) => {
    const { token, user } = await loginViaAPI(request, RELAWAN_EMAIL, RELAWAN_PASSWORD);
    await page.goto('/');
    await setAuthInBrowser(page, token, user);

    // Stub profil agar settings bisa termuat
    await page.route(
      (url) => url.pathname === '/api/users/profile',
      (route) => route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ emailNotificationEnabled: true, reminderNotificationEnabled: true }),
      }),
    );

    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: 'Pengaturan' })).toBeVisible({ timeout: 8_000 });

    // Section "Zona Bahaya" harus tampil
    await expect(page.getByText('Zona Bahaya')).toBeVisible();

    // Tombol "Hapus Akun Saya" harus ada
    const hapusBtn = page.getByRole('button', { name: /hapus akun saya/i });
    await expect(hapusBtn).toBeVisible();
  });

  test('[TC.HapusAkun.002] Klik hapus akun memunculkan dialog konfirmasi; setelah dikonfirmasi, user diarahkan ke /', async ({
    page,
    request,
  }) => {
    const { token, user } = await loginViaAPI(request, RELAWAN_EMAIL, RELAWAN_PASSWORD);
    await page.goto('/');
    await setAuthInBrowser(page, token, user);

    await page.route(
      (url) => url.pathname === '/api/users/profile',
      (route, req) => {
        if (req.method() === 'DELETE') {
          // Intercept DELETE agar akun nyata tidak terhapus
          route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
        } else {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ emailNotificationEnabled: true, reminderNotificationEnabled: true }),
          });
        }
      },
    );

    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: 'Pengaturan' })).toBeVisible({ timeout: 8_000 });
    await expect(page.getByText('Zona Bahaya')).toBeVisible({ timeout: 8_000 });

    // Pasang handler dialog sebelum klik agar tidak terlewat
    page.once('dialog', (dialog) => {
      // Dialog konfirmasi harus berisi kata "hapus" atau "tidak bisa dibatalkan"
      expect(dialog.message().toLowerCase()).toMatch(/hapus|tidak bisa dibatalkan/i);
      dialog.accept();
    });

    await page.getByRole('button', { name: /hapus akun saya/i }).click();

    // Setelah konfirmasi dan API sukses, redirect ke "/"
    await page.waitForURL((url) => url.pathname === '/', { timeout: 10_000 });
    expect(page.url()).toMatch(/\/$/);
  });
});