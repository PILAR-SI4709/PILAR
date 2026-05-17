/**
 * PBI #4 — Total Event Dashboard Admin
 * "Sebagai admin, saya ingin melihat total event di dashboard agar dapat memantau aktivitas platform."
 *
 * Referensi: README-TestPlan.md — section 4.4 (Dashboard Admin) & section 5 (Selectors)
 *
 * Strategi:
 *   TC.001 → Inject token admin, ambil GET /events/stats, bandingkan dengan stat card di UI
 *   TC.002 → Inject token relawan (USER), akses /dashboard/admin → redirect ke /dashboard
 */
import { test, expect } from '@playwright/test';
import { loginViaAPI, setAuthInBrowser } from '../helpers/auth';

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:3001/api';

const ADMIN_EMAIL    = process.env.TEST_ADMIN_EMAIL    ?? 'admin@pilar.id';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD ?? 'admin123';
const RELAWAN_EMAIL    = process.env.TEST_RELAWAN_EMAIL    ?? 'relawan@pilar.id';
const RELAWAN_PASSWORD = process.env.TEST_RELAWAN_PASSWORD ?? 'relawan123';

test.describe('[PBI #4] Total Event Dashboard Admin', () => {

  // ────────────────────────────────────────────────────────────────────────────
  // TC.TotalEvent.001 — Positif
  // Stat card Total Event menampilkan angka yang sesuai dengan response API.
  // ────────────────────────────────────────────────────────────────────────────
  test('[TC.TotalEvent.001] Stat card Total Event sesuai dengan data API', async ({
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

    // Cari stat card dengan label 'Total Event'
    const statCard = page.locator('.admin-stat').filter({ hasText: 'Total Event' });
    await expect(statCard).toBeVisible();

    // ── Assertions ──────────────────────────────────────────────────────────
    // 1. Nilai di stat card sesuai dengan data API
    await expect(statCard).toContainText(String(stats.totalEvent));

    // 2. Halaman tidak menampilkan pesan error
    await expect(page.getByText(/terjadi kesalahan/i)).not.toBeVisible();
    await expect(page.getByText(/error/i)).not.toBeVisible();
  });

  // ────────────────────────────────────────────────────────────────────────────
  // TC.TotalEvent.002 — Negatif
  // User dengan role USER (bukan ADMIN) di-redirect keluar dari /dashboard/admin.
  // ────────────────────────────────────────────────────────────────────────────
  test('[TC.TotalEvent.002] User non-admin di-redirect ke /dashboard', async ({
    page,
    request,
  }) => {
    // Setup: login sebagai relawan (role USER), inject token ke browser
    const { token, user } = await loginViaAPI(request, RELAWAN_EMAIL, RELAWAN_PASSWORD);
    await page.goto('/');
    await setAuthInBrowser(page, token, user);

    // Akses /dashboard/admin dengan role USER
    // Promise.all menghindari race condition: waitForURL aktif sebelum goto selesai,
    // sehingga redirect client-side dari useEffect tidak terlewat.
    await Promise.all([
      page.waitForURL((url) => url.pathname === '/dashboard', { timeout: 10_000 }),
      page.goto('/dashboard/admin'),
    ]);

    // ── Assertions ──────────────────────────────────────────────────────────
    // 1. User di-redirect ke /dashboard (bukan tetap di /dashboard/admin)
    expect(page.url()).not.toContain('/dashboard/admin');
    expect(page.url()).toContain('/dashboard');

    // 2. Konten dashboard admin TIDAK tampil
    await expect(page.getByText('Dashboard Administrator')).not.toBeVisible();
  });
});
