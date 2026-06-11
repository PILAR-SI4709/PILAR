/**
 * PBI #10 — Daftar Event (Homepage)
 * "Sebagai relawan, saya ingin melihat daftar event yang tersedia agar dapat
 *  memilih event yang ingin saya ikuti."
 *
 * Referensi: README-TestPlan.md — section 4.1 (Homepage) & section 5 (Selectors)
 *
 * Strategi:
 *   TC.001 → Mock GET /events → 1 item → cek .event-card-premium, judul, lokasi
 *   TC.002 → Mock GET /events → [] → cek teks 'Belum ada event mendatang'
 *
 * page.route() digunakan agar hasil test deterministik terlepas dari data DB.
 */
import { test, expect } from '@playwright/test';
import { loginViaAPI, setAuthInBrowser } from '../helpers/auth';

const RELAWAN_EMAIL    = process.env.TEST_RELAWAN_EMAIL    ?? 'relawan@pilar.id';
const RELAWAN_PASSWORD = process.env.TEST_RELAWAN_PASSWORD ?? 'relawan123';

const MOCK_EVENTS = [
  {
    id: 'mock-event-hp-001',
    judul: 'Bersih Pantai Test Syifa',
    deskripsi: 'Menjaga kebersihan lingkungan pantai bersama komunitas.',
    lokasi: 'Pantai Test, Jakarta Utara',
    tanggal: '2026-07-01T07:00:00.000Z',
    kuota: 50,
    status: 'UPCOMING',
    createdAt: '2026-05-01T00:00:00.000Z',
  },
];

test.describe('[PBI #10] Daftar Event', () => {

  // ──────────────────────────────────────────────────────────────────────────
  // TC.DaftarEvent.001 — Positif
  // Halaman utama menampilkan event cards dengan judul dan lokasi.
  // ──────────────────────────────────────────────────────────────────────────
  test('[TC.DaftarEvent.001] Event cards tampil di homepage dengan judul dan lokasi', async ({
    page,
    request,
  }) => {
    const { token, user } = await loginViaAPI(request, RELAWAN_EMAIL, RELAWAN_PASSWORD);
    await page.goto('/');
    await setAuthInBrowser(page, token, user);

    // Mock GET /events agar deterministik — selalu ada 1 event
    await page.route(
      (url) => url.pathname === '/api/events',
      (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_EVENTS),
        }),
    );

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // ── Assertions ──────────────────────────────────────────────────────────
    // 1. Minimal 1 event card (.event-card-premium) tampil
    await expect(page.locator('.event-card-premium').first()).toBeVisible({
      timeout: 8_000,
    });

    // 2. Judul event dari mock tampil di halaman
    await expect(page.getByText(MOCK_EVENTS[0].judul)).toBeVisible();

    // 3. Lokasi event dari mock tampil di halaman
    await expect(page.getByText(MOCK_EVENTS[0].lokasi)).toBeVisible();

    // 4. Pesan empty state TIDAK tampil
    await expect(page.getByText('Belum ada event mendatang')).not.toBeVisible();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TC.DaftarEvent.002 — Negatif
  // Saat tidak ada event, homepage menampilkan teks empty state.
  // ──────────────────────────────────────────────────────────────────────────
  test('[TC.DaftarEvent.002] Empty state tampil saat tidak ada event mendatang', async ({
    page,
    request,
  }) => {
    const { token, user } = await loginViaAPI(request, RELAWAN_EMAIL, RELAWAN_PASSWORD);
    await page.goto('/');
    await setAuthInBrowser(page, token, user);

    // Mock GET /events → array kosong
    await page.route(
      (url) => url.pathname === '/api/events',
      (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        }),
    );

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // ── Assertions ──────────────────────────────────────────────────────────
    // 1. Teks empty state tampil
    await expect(page.getByText('Belum ada event mendatang')).toBeVisible({
      timeout: 8_000,
    });

    // 2. Tidak ada event card
    await expect(page.locator('.event-card-premium')).toHaveCount(0);

    // 3. Tidak ada error di halaman
    await expect(page.getByText(/terjadi kesalahan/i)).not.toBeVisible();
  });
});
