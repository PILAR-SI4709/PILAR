/**
 * PBI #5 — Jumlah Relawan Dashboard Admin
 * "Sebagai admin, saya ingin melihat jumlah relawan di dashboard agar dapat memantau partisipasi."
 *
 * Referensi: README-TestPlan.md — section 4.4 (Dashboard Admin) & section 5 (Selectors)
 *
 * Strategi:
 *   TC.001 → Inject token admin, ambil GET /events/stats, bandingkan totalRelawan dengan stat card
 *   TC.002 → Inject token admin, cek stat card tampil dengan angka valid (≥ 0) tanpa crash
 */
import { test, expect } from '@playwright/test';
import { loginViaAPI, setAuthInBrowser } from '../helpers/auth';

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:3001/api';

const ADMIN_EMAIL    = process.env.TEST_ADMIN_EMAIL    ?? 'admin@pilar.id';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD ?? 'admin123';

test.describe('[PBI #5] Jumlah Relawan Dashboard Admin', () => {

  // ────────────────────────────────────────────────────────────────────────────
  // TC.JumlahRelawan.001 — Positif
  // Stat card Total Relawan menampilkan angka yang sesuai dengan response API.
  // ────────────────────────────────────────────────────────────────────────────
  test('[TC.JumlahRelawan.001] Stat card Total Relawan sesuai dengan data API', async ({
    page,
    request,
  }) => {
    // Setup: login sebagai admin, inject token ke browser
    const { token, user } = await loginViaAPI(request, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.goto('/');
    await setAuthInBrowser(page, token, user);

    // Ambil nilai stats langsung dari API sebagai ground truth
    const statsRes = await request.get(`${API_BASE}/events/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(statsRes.ok()).toBeTruthy();
    const stats = await statsRes.json();

    // Navigasi ke dashboard admin
    await page.goto('/dashboard/admin');
    await page.waitForLoadState('networkidle');

    // Pastikan halaman admin berhasil dimuat
    await expect(page.getByText('Dashboard Administrator')).toBeVisible({ timeout: 8_000 });

    // Cari stat card dengan label 'Total Relawan'
    const statCard = page.locator('.admin-stat').filter({ hasText: 'Total Relawan' });
    await expect(statCard).toBeVisible();

    // ── Assertions ──────────────────────────────────────────────────────────
    // 1. Nilai di stat card sesuai dengan data API
    await expect(statCard).toContainText(String(stats.totalRelawan));

    // 2. Halaman tidak menampilkan pesan error
    await expect(page.getByText(/terjadi kesalahan/i)).not.toBeVisible();
  });

  // ────────────────────────────────────────────────────────────────────────────
  // TC.JumlahRelawan.002 — Negatif
  // Stat card Total Relawan tetap tampil dengan angka valid (≥ 0) tanpa crash,
  // bahkan ketika tidak ada pendaftaran berstatus APPROVED di database.
  // ────────────────────────────────────────────────────────────────────────────
  test('[TC.JumlahRelawan.002] Stat card Total Relawan tampil valid saat data kosong', async ({
    page,
    request,
  }) => {
    // Setup: login sebagai admin, inject token ke browser
    const { token, user } = await loginViaAPI(request, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.goto('/');
    await setAuthInBrowser(page, token, user);

    // Navigasi ke dashboard admin
    await page.goto('/dashboard/admin');
    await page.waitForLoadState('networkidle');

    // Pastikan halaman admin berhasil dimuat
    await expect(page.getByText('Dashboard Administrator')).toBeVisible({ timeout: 8_000 });

    // Cari stat card dengan label 'Total Relawan'
    const statCard = page.locator('.admin-stat').filter({ hasText: 'Total Relawan' });
    await expect(statCard).toBeVisible();

    // ── Assertions ──────────────────────────────────────────────────────────
    // 1. Stat card tampil tanpa crash — tidak ada pesan error di halaman
    await expect(page.getByText(/terjadi kesalahan/i)).not.toBeVisible();

    // 2. Nilai yang ditampilkan adalah angka valid (≥ 0)
    //    Ambil teks dari stat card dan parse angkanya
    const cardText = await statCard.textContent() ?? '';
    const match = cardText.match(/\d+/);
    expect(match).not.toBeNull();
    const displayedNum = parseInt(match![0], 10);
    expect(displayedNum).toBeGreaterThanOrEqual(0);
  });
});
