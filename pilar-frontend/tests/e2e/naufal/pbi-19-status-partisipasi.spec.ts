/**
 * PBI #19 — Lihat Status Partisipasi
 * "Sebagai relawan, saya ingin melihat status partisipasi agar dapat mengetahui status saya."
 *
 * Strategi:
 *   TC.001 -> Relawan login, akses halaman detail event yang didaftar.
 *             Mock GET /pendaftaran/cek/:id mengembalikan status PENDING.
 *             Ekspektasi: Muncul badge 'Kamu sudah terdaftar' dan label 'Menunggu'.
 *   TC.002 -> Relawan login, akses halaman detail event.
 *             Mock GET /pendaftaran/cek/:id mengembalikan status REJECTED.
 *             Ekspektasi: Muncul badge 'Kamu sudah terdaftar' dan label 'Ditolak'.
 */
import { test, expect } from '@playwright/test';
import { loginViaAPI, setAuthInBrowser } from '../helpers/auth';

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:3001/api';
const RELAWAN_EMAIL    = process.env.TEST_RELAWAN_EMAIL    ?? 'relawan@pilar.id';
const RELAWAN_PASSWORD = process.env.TEST_RELAWAN_PASSWORD ?? 'relawan123';

test.describe('[PBI #19] Lihat Status Partisipasi', () => {

  // ──────────────────────────────────────────────────────────────────────────
  // TC.StatusPartisipasiUser.001 — Positif: PENDING
  // ──────────────────────────────────────────────────────────────────────────
  test('[TC.StatusPartisipasiUser.001] Relawan melihat status pendaftaran Menunggu', async ({
    page,
    request,
  }) => {
    const { token, user } = await loginViaAPI(request, RELAWAN_EMAIL, RELAWAN_PASSWORD);

    // Ambil event pertama untuk target URL
    const eventsRes = await request.get(`${API_BASE}/events`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const event = (await eventsRes.json())[0];

    await page.goto('/');
    await setAuthInBrowser(page, token, user);

    // Mock response cek pendaftaran -> PENDING
    await page.route(
      (url) => url.pathname === `/api/pendaftaran/cek/${event.id}`,
      (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ terdaftar: true, status: 'PENDING' }),
        }),
    );

    await page.goto(`/events/${event.id}`);
    await page.waitForLoadState('networkidle');

    // Assertion dibuat lebih robust dengan mencari container status terlebih dahulu.
    const statusContainer = page.locator('div:has-text("Kamu sudah terdaftar")').first();
    await expect(statusContainer).toBeVisible({ timeout: 8_000 });

    // Verifikasi status spesifik ('Status: Menunggu Verifikasi') di dalam container tersebut.
    await expect(statusContainer.getByText('Status: Menunggu Verifikasi')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Daftar Jadi Relawan' })).not.toBeVisible();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TC.StatusPartisipasiUser.002 — Positif: REJECTED
  // ──────────────────────────────────────────────────────────────────────────
  test('[TC.StatusPartisipasiUser.002] Relawan melihat status pendaftaran Ditolak', async ({
    page,
    request,
  }) => {
    const { token, user } = await loginViaAPI(request, RELAWAN_EMAIL, RELAWAN_PASSWORD);

    const eventsRes = await request.get(`${API_BASE}/events`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const event = (await eventsRes.json())[0];

    await page.goto('/');
    await setAuthInBrowser(page, token, user);

    // Mock response cek pendaftaran -> REJECTED
    await page.route(
      (url) => url.pathname === `/api/pendaftaran/cek/${event.id}`,
      (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ terdaftar: true, status: 'REJECTED' }),
        }),
    );

    await page.goto(`/events/${event.id}`);
    await page.waitForLoadState('networkidle');

    // Assertion dibuat lebih robust dengan mencari container status terlebih dahulu.
    const statusContainer = page.locator('div:has-text("Kamu sudah terdaftar")').first();
    await expect(statusContainer).toBeVisible({ timeout: 8_000 });

    // Verifikasi status spesifik ('Status: Ditolak') di dalam container tersebut.
    await expect(statusContainer.getByText('Status: Ditolak')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Daftar Jadi Relawan' })).not.toBeVisible();
  });
});