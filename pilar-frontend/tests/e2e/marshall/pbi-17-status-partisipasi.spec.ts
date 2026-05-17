/**
 * PBI #17 — Kelola Status Partisipasi
 * "Sebagai admin, saya ingin menyetujui atau menolak pendaftaran relawan."
 *
 * Strategi:
 *   TC.001 → Admin klik tab 'Menunggu', klik 'Terima' → toast 'Relawan diterima',
 *            peserta berpindah ke tab 'Diterima'
 *   TC.002 → Admin klik tab 'Menunggu', klik 'Tolak' → toast 'Relawan ditolak',
 *            peserta berpindah ke tab 'Ditolak'
 *
 * Mocking: Counter variable memungkinkan /pendaftaran/event/:id mengembalikan
 * data berbeda di fetch pertama (PENDING) vs re-fetch setelah PATCH (APPROVED/REJECTED).
 */
import { test, expect } from '@playwright/test';
import { loginViaAPI, setAuthInBrowser } from '../helpers/auth';

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:3001/api';

const ADMIN_EMAIL    = process.env.TEST_ADMIN_EMAIL    ?? 'admin@pilar.id';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD ?? 'admin123';

const MOCK_PDFT_ID = 'mock-admin-pdft-m17';

const makePeserta = (status: string, eventId: string) => ({
  id: MOCK_PDFT_ID,
  userId: 'relawan-user-id',
  eventId,
  status,
  nik: '3201234567890001',
  noHp: '081234567890',
  tanggalLahir: '2000-01-15T00:00:00.000Z',
  motivasi: 'Ingin membantu lingkungan.',
  alamat: 'Jl. Test No. 1',
  user: { id: 'relawan-user-id', nama: 'Relawan Test Marshall', email: 'relawan@pilar.id' },
});

test.describe('[PBI #17] Kelola Status Partisipasi', () => {

  // ──────────────────────────────────────────────────────────────────────────
  // TC.StatusPartisipasi.001 — Positif: Approve
  // Admin klik tab Menunggu → klik Terima → toast 'Relawan diterima' →
  // kartu berpindah ke tab Diterima.
  // ──────────────────────────────────────────────────────────────────────────
  test('[TC.StatusPartisipasi.001] Admin approve pendaftaran relawan', async ({
    page,
    request,
  }) => {
    const { token, user } = await loginViaAPI(request, ADMIN_EMAIL, ADMIN_PASSWORD);

    const eventsRes = await request.get(`${API_BASE}/events`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const event = (await eventsRes.json())[0];

    await page.goto('/');
    await setAuthInBrowser(page, token, user);

    // State flag: after PATCH approve, re-fetch returns APPROVED
    let approved = false;

    await page.route(
      (url) => url.pathname === `/api/pendaftaran/event/${event.id}`,
      (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([makePeserta(approved ? 'APPROVED' : 'PENDING', event.id)]),
        }),
    );

    await page.route(
      (url) => url.pathname === `/api/pendaftaran/${MOCK_PDFT_ID}/status`,
      async (route) => {
        approved = true;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(makePeserta('APPROVED', event.id)),
        });
      },
    );

    await page.goto(`/dashboard/admin/events/${event.id}/peserta`);
    await page.waitForLoadState('networkidle');

    // Klik tab 'Menunggu'
    await page.getByRole('button', { name: /Menunggu/ }).click();

// Klik tombol 'Terima' pada kartu pertama
    await expect(page.getByRole('button', { name: 'Terima', exact: true })).toBeVisible({
      timeout: 8_000,
    });
    await page.getByRole('button', { name: 'Terima', exact: true }).first().click();

    // ── Assertions ──────────────────────────────────────────────────────────
    // 1. Toast 'Relawan diterima' muncul
    await expect(page.getByText('Relawan diterima')).toBeVisible({ timeout: 8_000 });

    // 2. Klik tab 'Diterima' dan verifikasi kartu muncul
    await page.getByRole('button', { name: /Diterima/ }).click();
    await expect(page.getByText('Relawan Test Marshall')).toBeVisible({ timeout: 5_000 });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TC.StatusPartisipasi.002 — Negatif: Reject
  // Admin klik tab Menunggu → klik Tolak → toast 'Relawan ditolak' →
  // kartu berpindah ke tab Ditolak.
  // ──────────────────────────────────────────────────────────────────────────
  test('[TC.StatusPartisipasi.002] Admin tolak pendaftaran relawan', async ({
    page,
    request,
  }) => {
    const { token, user } = await loginViaAPI(request, ADMIN_EMAIL, ADMIN_PASSWORD);

    const eventsRes = await request.get(`${API_BASE}/events`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const event = (await eventsRes.json())[0];

    await page.goto('/');
    await setAuthInBrowser(page, token, user);

    // State flag: after PATCH reject, re-fetch returns REJECTED
    let rejected = false;

    await page.route(
      (url) => url.pathname === `/api/pendaftaran/event/${event.id}`,
      (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([makePeserta(rejected ? 'REJECTED' : 'PENDING', event.id)]),
        }),
    );

    await page.route(
      (url) => url.pathname === `/api/pendaftaran/${MOCK_PDFT_ID}/status`,
      async (route) => {
        rejected = true;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(makePeserta('REJECTED', event.id)),
        });
      },
    );

    await page.goto(`/dashboard/admin/events/${event.id}/peserta`);
    await page.waitForLoadState('networkidle');

    // Klik tab 'Menunggu'
    await page.getByRole('button', { name: /Menunggu/ }).click();

// Klik tombol 'Tolak' pada kartu pertama
    await expect(page.getByRole('button', { name: 'Tolak', exact: true })).toBeVisible({
      timeout: 8_000,
    });
    await page.getByRole('button', { name: 'Tolak', exact: true }).first().click();

    // ── Assertions ──────────────────────────────────────────────────────────
    // 1. Toast 'Relawan ditolak' muncul
    await expect(page.getByText('Relawan ditolak')).toBeVisible({ timeout: 8_000 });

    // 2. Klik tab 'Ditolak' dan verifikasi kartu muncul
    await page.getByRole('button', { name: /Ditolak/ }).click();
    await expect(page.getByText('Relawan Test Marshall')).toBeVisible({ timeout: 5_000 });
  });
});
