/**
 * PBI #14 — Edit Event
 * "Sebagai admin, saya ingin mengedit event agar informasi selalu akurat."
 *
 * Strategi:
 *   TC.001 → Admin ambil event pertama, buka /edit, ubah judul, Simpan Perubahan
 *            afterTest: restore judul asli via API
 *   TC.002 → PATCH /events/id-tidak-ada → cek response 404
 */
import { test, expect } from '@playwright/test';
import { loginViaAPI, setAuthInBrowser } from '../helpers/auth';

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:3001/api';

const ADMIN_EMAIL    = process.env.TEST_ADMIN_EMAIL    ?? 'admin@pilar.id';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD ?? 'admin123';

const UPDATED_JUDUL = '[TEST] Event Updated Feyza';

test.describe('[PBI #14] Edit Event', () => {

  // ──────────────────────────────────────────────────────────────────────────
  // TC.EditEvent.001 — Positif
  // Admin berhasil mengupdate judul event; toast sukses muncul.
  // ──────────────────────────────────────────────────────────────────────────
  test('[TC.EditEvent.001] Admin berhasil mengupdate data event', async ({
    page,
    request,
  }) => {
    const { token, user } = await loginViaAPI(request, ADMIN_EMAIL, ADMIN_PASSWORD);

    // Ambil event pertama dari API
    const eventsRes = await request.get(`${API_BASE}/events`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(eventsRes.ok()).toBeTruthy();
    const events = await eventsRes.json();
    expect(events.length).toBeGreaterThan(0);
    const event = events[0];
    const originalJudul = event.judul;

    await page.goto('/');
    await setAuthInBrowser(page, token, user);

    try {
      // Navigasi ke halaman edit
      await page.goto(`/dashboard/admin/events/${event.id}/edit`);
      await page.waitForLoadState('networkidle');

      // Pastikan form termuat dengan data existing
      await expect(
        page.locator('input.input[placeholder="Contoh: Bersih Pantai Kuta"]'),
      ).toBeVisible({ timeout: 8_000 });

      // Ubah judul
      const judulInput = page.locator('input.input[placeholder="Contoh: Bersih Pantai Kuta"]');
      await judulInput.clear();
      await judulInput.fill(UPDATED_JUDUL);

      // Klik Simpan Perubahan
      await page.getByRole('button', { name: 'Simpan Perubahan' }).click();

      // ── Assertions ──────────────────────────────────────────────────────
      // 1. Toast sukses muncul
      await expect(page.getByText('Event berhasil diperbarui!')).toBeVisible({
        timeout: 8_000,
      });

      // 2. Redirect ke /dashboard/admin
      await page.waitForURL((url) => url.pathname === '/dashboard/admin', {
        timeout: 8_000,
      });

    } finally {
      // Cleanup: kembalikan judul asli
      await request.patch(`${API_BASE}/events/${event.id}`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { judul: originalJudul },
      });
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TC.EditEvent.002 — Negatif
  // PATCH /events/id-tidak-ada → 404 dengan pesan 'Event tidak ditemukan'.
  // ──────────────────────────────────────────────────────────────────────────
  test('[TC.EditEvent.002] Edit event dengan id yang tidak ada mengembalikan 404', async ({
    request,
  }) => {
    const { token } = await loginViaAPI(request, ADMIN_EMAIL, ADMIN_PASSWORD);

    const res = await request.patch(`${API_BASE}/events/id-tidak-ada-sama-sekali`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { judul: 'Updated' },
    });

    // ── Assertions ──────────────────────────────────────────────────────────
    expect(res.status()).toBe(404);

    const body = await res.json();
    expect(JSON.stringify(body)).toContain('Event tidak ditemukan');
  });
});
