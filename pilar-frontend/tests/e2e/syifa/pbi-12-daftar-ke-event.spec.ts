/**
 * PBI #12 — Daftar ke Event
 * "Sebagai relawan, saya ingin mendaftar ke event agar dapat berpartisipasi
 *  sebagai relawan di kegiatan tersebut."
 *
 * Referensi: README-TestPlan.md — section 4.3 (Pendaftaran) & section 5 (Selectors)
 *
 * Strategi:
 *   TC.001 → Login, buka /events/:id/daftar, isi 5 langkah form, submit
 *            Mock POST /pendaftaran → 201 (hindari data sampah di DB)
 *            Cek toast 'Pendaftaran berhasil!'
 *   TC.002 → Mock GET /pendaftaran/cek/:id → {terdaftar: true, status: 'PENDING'}
 *            Buka /events/:id, cek badge 'Kamu sudah terdaftar' + 'Menunggu Verifikasi'
 *
 * Catatan:
 *   - Kesehatan checkboxes adalah custom div (bukan <input type="checkbox">)
 *     → gunakan locator('label').filter().locator('div').first().click()
 *   - Izin checkbox sama, tersedia di step 5
 */
import { test, expect } from '@playwright/test';
import { loginViaAPI, setAuthInBrowser } from '../helpers/auth';

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:3001/api';

const RELAWAN_EMAIL    = process.env.TEST_RELAWAN_EMAIL    ?? 'relawan@pilar.id';
const RELAWAN_PASSWORD = process.env.TEST_RELAWAN_PASSWORD ?? 'relawan123';

test.describe('[PBI #12] Daftar ke Event', () => {

  // ──────────────────────────────────────────────────────────────────────────
  // TC.DaftarKeEvent.001 — Positif
  // Form pendaftaran 5 langkah dapat dilengkapi dan disubmit;
  // toast sukses 'Pendaftaran berhasil!' muncul setelah submit.
  // ──────────────────────────────────────────────────────────────────────────
  test('[TC.DaftarKeEvent.001] Relawan berhasil mendaftar melalui form 5 langkah', async ({
    page,
    request,
  }) => {
    const { token, user } = await loginViaAPI(request, RELAWAN_EMAIL, RELAWAN_PASSWORD);

    // Ambil event UPCOMING pertama dari API
    const eventsRes = await request.get(`${API_BASE}/events?status=UPCOMING`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(eventsRes.ok()).toBeTruthy();
    const events = await eventsRes.json();
    expect(events.length).toBeGreaterThan(0);
    const event = events[0];

    await page.goto('/');
    await setAuthInBrowser(page, token, user);

    // Mock POST /pendaftaran → 201 (hindari data nyata di DB)
    await page.route(
      (url) => url.pathname === '/api/pendaftaran',
      async (route) => {
        if (route.request().method() === 'POST') {
          await route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify({
              id: 'mock-pdft-s001',
              eventId: event.id,
              status: 'PENDING',
              motivasi: 'Test motivasi',
            }),
          });
        } else {
          await route.continue();
        }
      },
    );

    // Navigasi ke form pendaftaran
    await page.goto(`/events/${event.id}/daftar`);
    await page.waitForLoadState('networkidle');

    // ── Step 1: Informasi Umum ───────────────────────────────────────────────
    await expect(page.getByText('Informasi Umum')).toBeVisible({ timeout: 8_000 });

    // Isi Nomor HP (satu-satunya field aktif di step 1)
    await page.locator('input.input[type="tel"]').fill('081234567890');

    await page.getByRole('button', { name: 'Lanjut' }).click();

    // ── Step 2: Identitas Diri ────────────────────────────────────────────────
    await expect(page.getByText('Identitas Diri')).toBeVisible({ timeout: 5_000 });

    await page.locator('input.input[placeholder="16 digit NIK"]').fill('3201234567890001');
    await page.locator('input.input[type="date"]').fill('2000-01-15');
    await page.locator('textarea.input').fill('Jl. Contoh No. 1, Jakarta Selatan');

    await page.getByRole('button', { name: 'Lanjut' }).click();

    // ── Step 3: Motivasi ──────────────────────────────────────────────────────
    await expect(page.getByText('Motivasi')).toBeVisible({ timeout: 5_000 });

    await page.locator('textarea.input').fill(
      'Saya ingin membantu menjaga kebersihan lingkungan pantai dan berkontribusi untuk alam.',
    );

    await page.getByRole('button', { name: 'Lanjut' }).click();

    // ── Step 4: Kondisi Kesehatan ─────────────────────────────────────────────
    await expect(page.getByText('Kondisi Kesehatan')).toBeVisible({ timeout: 5_000 });

    // Klik setiap custom checkbox kesehatan (onClick ada di div pertama dalam label)
    for (const labelText of [
      'Tidak memiliki penyakit jantung',
      'Tidak memiliki asma atau gangguan pernapasan',
      'Mampu berjalan jauh lebih dari 2 km',
      'Tidak alergi terhadap lingkungan laut',
      'Tidak dalam kondisi hamil atau menyusui',
    ]) {
      await page
        .locator('label')
        .filter({ hasText: labelText })
        .locator('div')
        .first()
        .click();
    }

    await page.getByRole('button', { name: 'Lanjut' }).click();

    // ── Step 5: Pernyataan Izin ───────────────────────────────────────────────
    await expect(page.getByText('Pernyataan Izin')).toBeVisible({ timeout: 5_000 });

    // Centang checkbox izin (custom div dengan onClick)
    await page
      .locator('label')
      .filter({ hasText: 'Saya menyetujui pernyataan di atas' })
      .locator('div')
      .first()
      .click();

    // Submit form
    await page.getByRole('button', { name: 'Kirim Pendaftaran' }).click();

    // ── Assertions ──────────────────────────────────────────────────────────
    // Toast sukses muncul setelah submit
    await expect(
      page.getByText('Pendaftaran berhasil! Menunggu persetujuan admin.'),
    ).toBeVisible({ timeout: 8_000 });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TC.DaftarKeEvent.002 — Kondisi sudah terdaftar
  // Saat relawan sudah mendaftar, halaman detail event menampilkan badge
  // 'Kamu sudah terdaftar' dan status 'Menunggu Verifikasi'.
  // ──────────────────────────────────────────────────────────────────────────
  test('[TC.DaftarKeEvent.002] Relawan yang sudah terdaftar melihat badge status pendaftaran', async ({
    page,
    request,
  }) => {
    const { token, user } = await loginViaAPI(request, RELAWAN_EMAIL, RELAWAN_PASSWORD);

    // Ambil event UPCOMING pertama dari API
    const eventsRes = await request.get(`${API_BASE}/events?status=UPCOMING`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(eventsRes.ok()).toBeTruthy();
    const events = await eventsRes.json();
    expect(events.length).toBeGreaterThan(0);
    const event = events[0];

    await page.goto('/');
    await setAuthInBrowser(page, token, user);

    // Mock GET /pendaftaran/cek/:id → relawan sudah terdaftar, status PENDING
    await page.route(
      (url) => url.pathname === `/api/pendaftaran/cek/${event.id}`,
      (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ terdaftar: true, status: 'PENDING' }),
        }),
    );

    // Navigasi ke halaman detail event
    await page.goto(`/events/${event.id}`);
    await page.waitForLoadState('networkidle');

    // ── Assertions ──────────────────────────────────────────────────────────
    // 1. Badge 'Kamu sudah terdaftar' tampil
    await expect(page.getByText('Kamu sudah terdaftar')).toBeVisible({ timeout: 8_000 });

    // 2. Status 'Menunggu Verifikasi' tampil
    await expect(page.getByText('Menunggu Verifikasi')).toBeVisible();

    // 3. Tombol 'Daftar Jadi Relawan' TIDAK tampil
    await expect(
      page.getByRole('button', { name: 'Daftar Jadi Relawan' }),
    ).not.toBeVisible();
  });
});
