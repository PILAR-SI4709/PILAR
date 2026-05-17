/**
 * PBI #9 — Riwayat Event Relawan
 * "Sebagai relawan, saya ingin melihat riwayat pendaftaran saya agar dapat memantau
 *  status dan history keikutsertaan di event."
 *
 * Referensi: README-TestPlan.md — section 4.4 (Dashboard Relawan) & section 5 (Selectors)
 *
 * Strategi:
 *   TC.001 → Mock GET /pendaftaran/my mengembalikan 1 item → cek baris riwayat + badge status
 *   TC.002 → Mock GET /pendaftaran/my mengembalikan [] → cek teks 'Belum ada pendaftaran'
 *
 * Menggunakan page.route() untuk mendapatkan state yang deterministik terlepas dari
 * data di database (relawan mungkin punya 0 atau banyak pendaftaran).
 */
import { test, expect } from '@playwright/test';
import { loginViaAPI, setAuthInBrowser } from '../helpers/auth';

const RELAWAN_EMAIL    = process.env.TEST_RELAWAN_EMAIL    ?? 'relawan@pilar.id';
const RELAWAN_PASSWORD = process.env.TEST_RELAWAN_PASSWORD ?? 'relawan123';

// Mock data: satu pendaftaran dengan status APPROVED
const MOCK_PENDAFTARAN = [
  {
    id: 'mock-pdft-001',
    userId: 'feb52476-a77e-4d1b-a9a0-eea883b17c60',
    eventId: 'mock-event-001',
    status: 'APPROVED',
    motivasi: 'Ingin membantu lingkungan',
    createdAt: '2026-05-01T08:00:00.000Z',
    event: {
      id: 'mock-event-001',
      judul: 'Bersih Pantai Ancol',
      lokasi: 'Pantai Ancol, Jakarta',
      tanggal: '2026-06-15T07:00:00.000Z',
    },
  },
];

test.describe('[PBI #9] Riwayat Event Relawan', () => {

  // ──────────────────────────────────────────────────────────────────────────
  // TC.RiwayatEvent.001 — Positif
  // Saat pendaftaran ada, seksi 'Riwayat Pendaftaran' menampilkan nama event
  // dan badge status yang sesuai.
  // ──────────────────────────────────────────────────────────────────────────
  test('[TC.RiwayatEvent.001] Riwayat pendaftaran tampil dengan nama event dan badge status', async ({
    page,
    request,
  }) => {
    const { token, user } = await loginViaAPI(request, RELAWAN_EMAIL, RELAWAN_PASSWORD);
    await page.goto('/');
    await setAuthInBrowser(page, token, user);

    // Mock /pendaftaran/my agar selalu mengembalikan 1 item APPROVED
    // (deterministik, tidak bergantung data DB)
    await page.route('**/api/pendaftaran/my', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_PENDAFTARAN),
      }),
    );

    // Navigasi ke /dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Pastikan dashboard relawan termuat
    await expect(page.getByText('Dashboard Relawan')).toBeVisible({ timeout: 8_000 });

    // ── Assertions ──────────────────────────────────────────────────────────
    // 1. Seksi 'Riwayat Pendaftaran' tampil
    await expect(page.getByText('Riwayat Pendaftaran')).toBeVisible();

    // 2. Minimal 1 baris riwayat tampil dengan nama event
    await expect(
      page.getByText(MOCK_PENDAFTARAN[0].event.judul),
    ).toBeVisible({ timeout: 5_000 });

    // 3. Badge status APPROVED → label 'Diterima' tampil sebagai <span>
    //    Gunakan locator('span') untuk menghindari strict mode violation dengan
    //    div 'Pendaftaran Diterima' di stat card header yang juga ada di halaman.
    await expect(page.locator('span').filter({ hasText: /^Diterima$/ })).toBeVisible();

    // 4. Tidak ada pesan 'Belum ada pendaftaran'
    await expect(page.getByText('Belum ada pendaftaran')).not.toBeVisible();
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TC.RiwayatEvent.002 — Negatif
  // Saat pendaftaran kosong, seksi 'Riwayat Pendaftaran' menampilkan
  // empty state 'Belum ada pendaftaran' tanpa error.
  // ──────────────────────────────────────────────────────────────────────────
  test('[TC.RiwayatEvent.002] Empty state tampil saat belum ada riwayat pendaftaran', async ({
    page,
    request,
  }) => {
    const { token, user } = await loginViaAPI(request, RELAWAN_EMAIL, RELAWAN_PASSWORD);
    await page.goto('/');
    await setAuthInBrowser(page, token, user);

    // Mock /pendaftaran/my agar selalu mengembalikan array kosong
    await page.route('**/api/pendaftaran/my', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      }),
    );

    // Navigasi ke /dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Pastikan dashboard relawan termuat
    await expect(page.getByText('Dashboard Relawan')).toBeVisible({ timeout: 8_000 });

    // ── Assertions ──────────────────────────────────────────────────────────
    // 1. Seksi 'Riwayat Pendaftaran' tampil
    await expect(page.getByText('Riwayat Pendaftaran')).toBeVisible();

    // 2. Teks empty state 'Belum ada pendaftaran' tampil
    await expect(page.getByText('Belum ada pendaftaran')).toBeVisible();

    // 3. Tidak ada baris riwayat (tidak ada nama event dari mock)
    await expect(page.getByText('Bersih Pantai Ancol')).not.toBeVisible();

    // 4. Tidak ada error di halaman
    await expect(page.getByText(/terjadi kesalahan/i)).not.toBeVisible();
  });
});
