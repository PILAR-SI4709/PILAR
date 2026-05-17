/**
 * PBI #15 — Hapus Event
 * "Sebagai admin, saya ingin menghapus event agar daftar selalu relevan."
 *
 * Strategi:
 *   TC.001 → Buat event via createEventViaAPI, buka /dashboard/admin,
 *            klik Hapus pada baris event, konfirmasi dialog,
 *            cek toast 'Event dihapus', event hilang dari tabel
 *   TC.002 → DELETE /events/id-tidak-ada → cek response 404
 */
import { test, expect } from '@playwright/test';
import {
  loginViaAPI,
  setAuthInBrowser,
  createEventViaAPI,
  deleteEventViaAPI,
} from '../helpers/auth';

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:3001/api';

const ADMIN_EMAIL    = process.env.TEST_ADMIN_EMAIL    ?? 'admin@pilar.id';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD ?? 'admin123';

test.describe('[PBI #15] Hapus Event', () => {

  // ──────────────────────────────────────────────────────────────────────────
  // TC.HapusEvent.001 — Positif
  // Admin membuat event → klik Hapus di tabel → konfirmasi dialog →
  // toast 'Event dihapus' muncul, event hilang dari daftar.
  // ──────────────────────────────────────────────────────────────────────────
  test('[TC.HapusEvent.001] Admin berhasil menghapus event', async ({
    page,
    request,
  }) => {
    const { token, user } = await loginViaAPI(request, ADMIN_EMAIL, ADMIN_PASSWORD);

    // Buat event test terlebih dahulu via API
    const testEvent = await createEventViaAPI(request, token, {
      judul: '[TEST] Event Hapus Feyza',
      deskripsi: 'Event untuk test hapus',
      lokasi: 'Lokasi Test Hapus',
      tanggal: '2026-07-01T08:00:00.000Z',
      kuota: 5,
    });

    await page.goto('/');
    await setAuthInBrowser(page, token, user);

    try {
      // Handle window.confirm("Hapus event ini?") — langsung accept
      page.on('dialog', (dialog) => dialog.accept());

      // Navigasi ke /dashboard/admin
      await page.goto('/dashboard/admin');
      await page.waitForLoadState('networkidle');

      // Pastikan event test tampil di tabel
      await expect(page.getByText(testEvent.judul)).toBeVisible({ timeout: 8_000 });

      // Klik tombol Hapus pada baris event test
      const row = page.locator('tr').filter({ hasText: testEvent.judul });
      await row.getByRole('button', { name: 'Hapus' }).click();

      // ── Assertions ──────────────────────────────────────────────────────
      // 1. Toast 'Event dihapus' muncul
      await expect(page.getByText('Event dihapus')).toBeVisible({ timeout: 8_000 });

      // 2. Event hilang dari daftar setelah re-fetch
      await expect(page.getByText(testEvent.judul)).not.toBeVisible({
        timeout: 5_000,
      });

    } catch (err) {
      // Cleanup jika test gagal sebelum hapus berhasil
      await deleteEventViaAPI(request, token, testEvent.id).catch(() => {});
      throw err;
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TC.HapusEvent.002 — Negatif
  // DELETE /events/id-tidak-ada → 404 dengan pesan 'Event tidak ditemukan'.
  // ──────────────────────────────────────────────────────────────────────────
  test('[TC.HapusEvent.002] Hapus event dengan id yang tidak ada mengembalikan 404', async ({
    request,
  }) => {
    const { token } = await loginViaAPI(request, ADMIN_EMAIL, ADMIN_PASSWORD);

    const res = await request.delete(`${API_BASE}/events/id-tidak-ada-sama-sekali`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // ── Assertions ──────────────────────────────────────────────────────────
    expect(res.status()).toBe(404);

    const body = await res.json();
    expect(JSON.stringify(body)).toContain('Event tidak ditemukan');
  });
});
