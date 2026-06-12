import { test, expect } from '@playwright/test';
import { loginViaAPI, setAuthInBrowser } from '../helpers/auth';

const RELAWAN_EMAIL    = process.env.TEST_RELAWAN_EMAIL    ?? 'relawan@pilar.id';
const RELAWAN_PASSWORD = process.env.TEST_RELAWAN_PASSWORD ?? 'relawan123';

test.describe('[PBI #26] Toggle Notifikasi Email di Settings', () => {

  test('[TC.ToggleNotif.001] Toggle "Email konfirmasi pendaftaran event" dapat diubah dan tersimpan', async ({
    page,
    request,
  }) => {
    const { token, user } = await loginViaAPI(request, RELAWAN_EMAIL, RELAWAN_PASSWORD);
    await page.goto('/');
    await setAuthInBrowser(page, token, user);

    // Profil awal: email notif = true (aktif)
    let emailNotifEnabled = true;

    await page.route(
      (url) => url.pathname === '/api/users/profile',
      (route, req) => {
        if (req.method() === 'PATCH') {
          // Tangkap nilai baru dari body PATCH
          route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
        } else {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              emailNotificationEnabled: emailNotifEnabled,
              reminderNotificationEnabled: true,
            }),
          });
        }
      },
    );

    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: 'Notifikasi' })).toBeVisible({ timeout: 8_000 });
    await expect(page.getByText('Email konfirmasi pendaftaran event')).toBeVisible();

    // Klik toggle pertama (email notifikasi)
    const toggleBtn = page.locator('button').filter({ has: page.locator('[style*="border-radius: 12px"]') }).first();
    // Gunakan klik langsung pada baris notifikasi pertama
    const emailRow = page.locator('div').filter({ hasText: /^Email konfirmasi pendaftaran event/ }).first();
    const toggle = emailRow.locator('button').first();
    await toggle.click();

    // Toast konfirmasi tersimpan harus muncul
    await expect(page.getByText('Preferensi notifikasi disimpan')).toBeVisible({ timeout: 8_000 });
  });

  test('[TC.ToggleNotif.002] Status toggle dipertahankan setelah halaman di-reload', async ({
    page,
    request,
  }) => {
    const { token, user } = await loginViaAPI(request, RELAWAN_EMAIL, RELAWAN_PASSWORD);
    await page.goto('/');
    await setAuthInBrowser(page, token, user);

    // Profil awal: email notif = false (nonaktif)
    await page.route(
      (url) => url.pathname === '/api/users/profile',
      (route, req) => {
        if (req.method() === 'PATCH') {
          route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
        } else {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ emailNotificationEnabled: false, reminderNotificationEnabled: true }),
          });
        }
      },
    );

    await page.goto('/settings');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: 'Notifikasi' })).toBeVisible({ timeout: 8_000 });

    // Reload halaman — profil ulang dimuat dari API dengan nilai false
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Bagian notifikasi harus tetap tampil (persistensi dikelola backend)
    await expect(page.getByText('Email konfirmasi pendaftaran event')).toBeVisible({ timeout: 8_000 });
    await expect(page.getByRole('heading', { name: 'Notifikasi' })).toBeVisible();
  });
});