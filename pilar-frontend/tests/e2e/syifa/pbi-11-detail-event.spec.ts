/**
 * PBI #11 — Detail Event
 * "Sebagai relawan, saya ingin melihat detail event agar dapat mengetahui
 *  informasi lengkap sebelum mendaftar."
 *
 * Referensi: README-TestPlan.md — section 4.2 (Detail Event) & section 5 (Selectors)
 *
 * Strategi:
 *   TC.001 → Login, ambil event nyata dari API, buka /events/:id, cek judul/lokasi/CTA
 *   TC.002 → Mock GET /events/:id → status DONE → cek teks 'Event sudah selesai'
 *            Mock GET /pendaftaran/cek/:id → {terdaftar: false} agar tidak ada redirect
 */
import { test, expect } from '@playwright/test';
import { loginViaAPI, setAuthInBrowser } from '../helpers/auth';

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:3001/api';

const RELAWAN_EMAIL    = process.env.TEST_RELAWAN_EMAIL    ?? 'relawan@pilar.id';
const RELAWAN_PASSWORD = process.env.TEST_RELAWAN_PASSWORD ?? 'relawan123';

const MOCK_DONE_EVENT = {
  id: 'mock-done-event-s001',
  judul: 'Bersih Pantai Selesai Syifa',
  deskripsi: 'Event pembersihan pantai yang sudah selesai dilaksanakan.',
  lokasi: 'Pantai Kuta, Bali',
  tanggal: '2025-01-15T07:00:00.000Z',
  kuota: 50,
  status: 'DONE',
  createdAt: '2025-01-01T00:00:00.000Z',
};

test.describe('[PBI #11] Detail Event', () => {

  // ──────────────────────────────────────────────────────────────────────────
  // TC.DetailEvent.001 — Positif
  // Halaman detail event menampilkan judul, lokasi, section 'Tentang Event',
  // dan tombol 'Daftar Jadi Relawan' untuk event UPCOMING.
  // ──────────────────────────────────────────────────────────────────────────
  test('[TC.DetailEvent.001] Halaman detail event menampilkan informasi lengkap', async ({
    page,
    request,
  }) => {
    const { token, user } = await loginViaAPI(request, RELAWAN_EMAIL, RELAWAN_PASSWORD);

    // Ambil event UPCOMING pertama dari API sebagai ground truth
    const eventsRes = await request.get(`${API_BASE}/events?status=UPCOMING`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(eventsRes.ok()).toBeTruthy();
    const events = await eventsRes.json();
    expect(events.length).toBeGreaterThan(0);
    const event = events[0];

    await page.goto('/');
    await setAuthInBrowser(page, token, user);

    // Mock GET /pendaftaran/cek/:id → relawan belum terdaftar (deterministik)
    await page.route(
      (url) => url.pathname === `/api/pendaftaran/cek/${event.id}`,
      (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ terdaftar: false }),
        }),
    );

    // Navigasi ke halaman detail event
    await page.goto(`/events/${event.id}`);
    await page.waitForLoadState('networkidle');

    // ── Assertions ──────────────────────────────────────────────────────────
    // 1. Judul event tampil
    await expect(page.getByText(event.judul).first()).toBeVisible({ timeout: 8_000 });

    // 2. Lokasi event tampil
    await expect(page.getByText(event.lokasi).first()).toBeVisible();

    // 3. Section 'Tentang Event' tampil
    await expect(page.getByText('Tentang Event')).toBeVisible();

    // 4. Tombol 'Daftar Jadi Relawan' tampil (belum terdaftar)
    await expect(
      page.getByRole('button', { name: 'Daftar Jadi Relawan' }),
    ).toBeVisible();

    // 5. Tidak ada pesan error di halaman
    await expect(page.getByText(/terjadi kesalahan/i)).not.toBeVisible();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TC.DetailEvent.002 — Negatif
  // Event berstatus DONE menampilkan pesan 'Event sudah selesai',
  // tombol daftar tidak tampil.
  // ──────────────────────────────────────────────────────────────────────────
  test('[TC.DetailEvent.002] Event dengan status DONE menampilkan pesan event sudah selesai', async ({
    page,
    request,
  }) => {
    const { token, user } = await loginViaAPI(request, RELAWAN_EMAIL, RELAWAN_PASSWORD);
    await page.goto('/');
    await setAuthInBrowser(page, token, user);

    // Mock GET /events/:id → event berstatus DONE (tidak ada di DB)
    await page.route(
      (url) => url.pathname === `/api/events/${MOCK_DONE_EVENT.id}`,
      (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_DONE_EVENT),
        }),
    );

    // Mock GET /pendaftaran/cek/:id → belum terdaftar
    await page.route(
      (url) => url.pathname === `/api/pendaftaran/cek/${MOCK_DONE_EVENT.id}`,
      (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ terdaftar: false }),
        }),
    );

    // Navigasi ke halaman detail event DONE
    await page.goto(`/events/${MOCK_DONE_EVENT.id}`);
    await page.waitForLoadState('networkidle');

    // ── Assertions ──────────────────────────────────────────────────────────
    // 1. Judul event tampil (.first() karena muncul di h1 dan div)
    await expect(page.getByText(MOCK_DONE_EVENT.judul).first()).toBeVisible({ timeout: 8_000 });

    // 2. Pesan 'Event sudah selesai' tampil
    await expect(page.getByText('Event sudah selesai')).toBeVisible();

    // 3. Tombol 'Daftar Jadi Relawan' TIDAK tampil
    await expect(
      page.getByRole('button', { name: 'Daftar Jadi Relawan' }),
    ).not.toBeVisible();
  });
});
