/**
 * PBI #16 — Lihat Daftar Peserta
 * "Sebagai admin, saya ingin melihat daftar peserta event agar dapat mengelola
 *  pendaftaran relawan."
 *
 * Strategi:
 *   TC.001 → Token admin, ambil event nyata dari API, mock GET /pendaftaran/event/:id
 *            → 1 peserta PENDING, akses halaman peserta, cek header + subtext + label NIK
 *   TC.002 → Token relawan, akses halaman peserta admin → redirect akhirnya ke /dashboard
 *            (backend 403 → frontend catch → router.push('/dashboard/admin')
 *                        → admin page → user.role≠ADMIN → router.push('/dashboard'))
 */
import { test, expect } from '@playwright/test';
import { loginViaAPI, setAuthInBrowser } from '../helpers/auth';

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:3001/api';

const ADMIN_EMAIL    = process.env.TEST_ADMIN_EMAIL    ?? 'admin@pilar.id';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD ?? 'admin123';
const RELAWAN_EMAIL    = process.env.TEST_RELAWAN_EMAIL    ?? 'relawan@pilar.id';
const RELAWAN_PASSWORD = process.env.TEST_RELAWAN_PASSWORD ?? 'relawan123';

const MOCK_PDFT_ID = 'mock-admin-pdft-m16';

const makePeserta = (status: string, eventId: string) => ({
  id: MOCK_PDFT_ID,
  userId: 'relawan-user-id',
  eventId,
  status,
  nik: '3201234567890001',
  noHp: '081234567890',
  tanggalLahir: '2000-01-15T00:00:00.000Z',
  motivasi: 'Ingin membantu menjaga kebersihan lingkungan pantai.',
  alamat: 'Jl. Test No. 1, Jakarta',
  user: {
    id: 'relawan-user-id',
    nama: 'Relawan Test Marshall',
    email: 'relawan@pilar.id',
  },
});

test.describe('[PBI #16] Lihat Daftar Peserta', () => {

  // ──────────────────────────────────────────────────────────────────────────
  // TC.DaftarPeserta.001 — Positif
  // Halaman peserta admin menampilkan header event, subtext pendaftar,
  // dan kartu peserta dengan label 'NIK'.
  // ──────────────────────────────────────────────────────────────────────────
  test('[TC.DaftarPeserta.001] Admin melihat daftar peserta event', async ({
    page,
    request,
  }) => {
    const { token, user } = await loginViaAPI(request, ADMIN_EMAIL, ADMIN_PASSWORD);

    // Ambil event pertama dari API (event nyata di DB)
    const eventsRes = await request.get(`${API_BASE}/events`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(eventsRes.ok()).toBeTruthy();
    const events = await eventsRes.json();
    expect(events.length).toBeGreaterThan(0);
    const event = events[0];

    await page.goto('/');
    await setAuthInBrowser(page, token, user);

    // Mock GET /pendaftaran/event/:id → 1 peserta PENDING
    await page.route(
      (url) => url.pathname === `/api/pendaftaran/event/${event.id}`,
      (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([makePeserta('PENDING', event.id)]),
        }),
    );

    // Navigasi ke halaman peserta
    await page.goto(`/dashboard/admin/events/${event.id}/peserta`);
    await page.waitForLoadState('networkidle');

    // ── Assertions ──────────────────────────────────────────────────────────
    // 1. Header event (judul) tampil
    await expect(page.getByText(event.judul).first()).toBeVisible({ timeout: 8_000 });

    // 2. Subtext mengandung 'pendaftar'
    await expect(page.getByText(/pendaftar/i)).toBeVisible();

    // 3. Kartu peserta dengan label 'NIK' tampil
    await expect(page.getByText('NIK')).toBeVisible();

    // 4. Nama peserta tampil
    await expect(page.getByText('Relawan Test Marshall')).toBeVisible();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TC.DaftarPeserta.002 — Negatif
  // Relawan yang coba akses halaman peserta admin di-redirect ke /dashboard
  // (backend 403 → frontend catch → admin page redirect non-admin ke /dashboard).
  // ──────────────────────────────────────────────────────────────────────────
  test('[TC.DaftarPeserta.002] Relawan tidak bisa akses halaman peserta admin', async ({
    page,
    request,
  }) => {
    const { token, user } = await loginViaAPI(request, RELAWAN_EMAIL, RELAWAN_PASSWORD);

    // Ambil event pertama
    const eventsRes = await request.get(`${API_BASE}/events`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const events = await eventsRes.json();
    const event = events[0];

    await page.goto('/');
    await setAuthInBrowser(page, token, user);

    // Navigasi ke halaman peserta sebagai relawan
    await page.goto(`/dashboard/admin/events/${event.id}/peserta`);

    // Tunggu redirect chain selesai ke /dashboard
    await page.waitForURL(
      (url) => url.pathname === '/dashboard',
      { timeout: 15_000 },
    );

    // ── Assertions ──────────────────────────────────────────────────────────
    expect(page.url()).toContain('/dashboard');
    expect(page.url()).not.toContain('/peserta');
  });
});
