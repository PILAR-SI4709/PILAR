/**
 * PBI #13 — Tambah Event
 * "Sebagai admin, saya ingin membuat event baru agar relawan dapat mendaftar."
 *
 * Strategi:
 *   TC.001 → Admin isi form /dashboard/admin/events/new → klik Simpan Event
 *            → cek toast + redirect ke /dashboard/admin
 *            afterTest: cleanup event via API
 *   TC.002 → Token relawan → POST /events via request context → cek 403
 */
import { test, expect } from '@playwright/test';
import {
  loginViaAPI,
  setAuthInBrowser,
  deleteEventViaAPI,
} from '../helpers/auth';

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:3001/api';

const ADMIN_EMAIL    = process.env.TEST_ADMIN_EMAIL    ?? 'admin@pilar.id';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD ?? 'admin123';
const RELAWAN_EMAIL    = process.env.TEST_RELAWAN_EMAIL    ?? 'relawan@pilar.id';
const RELAWAN_PASSWORD = process.env.TEST_RELAWAN_PASSWORD ?? 'relawan123';

const TEST_JUDUL = '[TEST] Bersih Pantai Test Feyza';

test.describe('[PBI #13] Tambah Event', () => {

  // ──────────────────────────────────────────────────────────────────────────
  // TC.TambahEvent.001 — Positif
  // Admin berhasil membuat event baru via form; toast sukses muncul dan
  // page redirect ke /dashboard/admin.
  // ──────────────────────────────────────────────────────────────────────────
  test('[TC.TambahEvent.001] Admin berhasil membuat event baru', async ({
    page,
    request,
  }) => {
    const { token, user } = await loginViaAPI(request, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.goto('/');
    await setAuthInBrowser(page, token, user);

    try {
      // Navigasi ke form tambah event
      await page.goto('/dashboard/admin/events/new');
      await page.waitForLoadState('networkidle');

      // Pastikan halaman termuat
      await expect(page.getByText('Tambah Event Baru')).toBeVisible({ timeout: 8_000 });

      // Isi field form
      await page.locator('input.input[placeholder="Contoh: Bersih Pantai Kuta"]').fill(TEST_JUDUL);
      await page.locator('textarea.input').fill('Kegiatan pembersihan pantai testing');
      await page.locator('input.input[placeholder="Pantai Kuta, Bali"]').fill('Pantai Test Jakarta');
      await page.locator('input.input[type="datetime-local"]').fill('2026-06-01T08:00');
      await page.locator('input.input[type="number"]').fill('10');

      // Klik tombol Simpan
      await page.getByRole('button', { name: 'Simpan Event' }).click();

      // ── Assertions ────────────────────────────────────────────────────────
      // 1. Toast sukses muncul
      await expect(page.getByText('Event berhasil dibuat!')).toBeVisible({
        timeout: 8_000,
      });

      // 2. Redirect ke /dashboard/admin
      await page.waitForURL((url) => url.pathname === '/dashboard/admin', {
        timeout: 8_000,
      });
      expect(page.url()).toContain('/dashboard/admin');

      // 3. Event baru muncul di daftar
      await expect(page.getByText(TEST_JUDUL)).toBeVisible({ timeout: 5_000 });

    } finally {
      // Cleanup: hapus event test agar tidak mengotori DB
      const eventsRes = await request.get(`${API_BASE}/events`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const events = await eventsRes.json();
      const testEvent = events.find((e: any) => e.judul === TEST_JUDUL);
      if (testEvent) await deleteEventViaAPI(request, token, testEvent.id);
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TC.TambahEvent.002 — Negatif
  // Token relawan → POST /events mengembalikan 403 Forbidden.
  // ──────────────────────────────────────────────────────────────────────────
  test('[TC.TambahEvent.002] Relawan tidak bisa membuat event (403 Forbidden)', async ({
    request,
  }) => {
    const { token } = await loginViaAPI(request, RELAWAN_EMAIL, RELAWAN_PASSWORD);

    // Kirim langsung via API dengan token relawan
    const res = await request.post(`${API_BASE}/events`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        judul: '[TEST] Tidak Boleh Dibuat',
        deskripsi: 'Test deskripsi',
        lokasi: 'Test Lokasi',
        tanggal: '2026-06-01T08:00:00.000Z',
        kuota: 10,
      },
    });

    // ── Assertions ──────────────────────────────────────────────────────────
    // Backend menolak dengan 403
    expect(res.status()).toBe(403);
  });
});
