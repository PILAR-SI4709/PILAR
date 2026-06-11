/**
 * PBI #18 — Sinkronisasi Data Peserta
 * "Sebagai admin, saya ingin perubahan status tersinkronisasi segera di UI."
 *
 * Strategi:
 *   TC.001 → Admin approve peserta; UI langsung menampilkan kartu di tab 'Diterima'
 *            tanpa refresh manual (re-fetch otomatis setelah updateStatus)
 *   TC.002 → Relawan dengan APPROVED pendaftaran → buka event detail →
 *            badge status APPROVED tampil ('Diterima')
 */
import { test, expect } from '@playwright/test';
import { loginViaAPI, setAuthInBrowser } from '../helpers/auth';

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:3001/api';

const ADMIN_EMAIL    = process.env.TEST_ADMIN_EMAIL    ?? 'admin@pilar.id';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD ?? 'admin123';
const RELAWAN_EMAIL    = process.env.TEST_RELAWAN_EMAIL    ?? 'relawan@pilar.id';
const RELAWAN_PASSWORD = process.env.TEST_RELAWAN_PASSWORD ?? 'relawan123';

const MOCK_PDFT_ID = 'mock-admin-pdft-m18';

const makePeserta = (status: string, eventId: string) => ({
  id: MOCK_PDFT_ID,
  userId: 'relawan-user-id',
  eventId,
  status,
  nik: '3201234567890001',
  noHp: '081234567890',
  tanggalLahir: '2000-01-15T00:00:00.000Z',
  motivasi: 'Ingin berkontribusi untuk lingkungan.',
  alamat: 'Jl. Test No. 1',
  user: { id: 'relawan-user-id', nama: 'Relawan Test Marshall', email: 'relawan@pilar.id' },
});

test.describe('[PBI #18] Sinkronisasi Data Peserta', () => {

  // ──────────────────────────────────────────────────────────────────────────
  // TC.SinkronData.001 — Positif: UI tersinkron setelah approve
  // Setelah admin approve peserta, kartu langsung muncul di tab 'Diterima'
  // tanpa reload halaman manual.
  // ──────────────────────────────────────────────────────────────────────────
  test('[TC.SinkronData.001] Status peserta tersinkron di UI setelah admin approve', async ({
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

    // State flag: setelah PATCH, re-fetch mengembalikan APPROVED
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

// Klik tab 'Menunggu' dan approve peserta
    await page.getByRole('button', { name: /Menunggu/ }).click();
    await expect(page.getByRole('button', { name: 'Terima', exact: true })).toBeVisible({
      timeout: 8_000,
    });
    await page.getByRole('button', { name: 'Terima', exact: true }).first().click();

    // Tunggu toast sukses
    await expect(page.getByText('Relawan diterima')).toBeVisible({ timeout: 8_000 });

    // ── Assertion: Tab 'Diterima' langsung menampilkan kartu tanpa reload ──
    await page.getByRole('button', { name: /Diterima/ }).click();
    await expect(page.getByText('Relawan Test Marshall')).toBeVisible({ timeout: 5_000 });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TC.SinkronData.002 — Positif: Badge status APPROVED tampil di event detail
  // Relawan yang sudah APPROVED melihat badge 'Diterima' di halaman event.
  // ──────────────────────────────────────────────────────────────────────────
  test('[TC.SinkronData.002] Badge status APPROVED tampil di halaman detail event relawan', async ({
    page,
    request,
  }) => {
    const { token, user } = await loginViaAPI(request, RELAWAN_EMAIL, RELAWAN_PASSWORD);

    // Ambil event pertama
    const eventsRes = await request.get(`${API_BASE}/events`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const event = (await eventsRes.json())[0];

    await page.goto('/');
    await setAuthInBrowser(page, token, user);

    // Mock GET /pendaftaran/cek/:id → APPROVED
    await page.route(
      (url) => url.pathname === `/api/pendaftaran/cek/${event.id}`,
      (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ terdaftar: true, status: 'APPROVED' }),
        }),
    );

    // Navigasi ke halaman detail event
    await page.goto(`/events/${event.id}`);
    await page.waitForLoadState('networkidle');

    // ── Assertions ──────────────────────────────────────────────────────────
    // 1. Badge 'Kamu sudah terdaftar' tampil
    await expect(page.getByText('Kamu sudah terdaftar')).toBeVisible({ timeout: 8_000 });

    // 2. Status 'Diterima' tampil (APPROVED → label 'Diterima')
    await expect(page.getByText('Diterima')).toBeVisible();

    // 3. Tombol 'Daftar Jadi Relawan' tidak tampil
    await expect(
      page.getByRole('button', { name: 'Daftar Jadi Relawan' }),
    ).not.toBeVisible();
  });
});
