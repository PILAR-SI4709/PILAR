/**
 * PBI #8 — Edit Profil Relawan
 * "Sebagai relawan, saya ingin mengubah profil saya agar data akun selalu up-to-date."
 *
 * Referensi: README-TestPlan.md — section 4.5 (Profil) & section 5 (Selectors)
 *
 * Strategi:
 *   TC.001 → Inject token, buka /profile, klik Edit, ubah nama, Simpan, cek toast + UI
 *            afterEach: restore nama asli via API agar tidak merusak test lain
 *   TC.002 → Inject token, buka /settings, isi password lama salah, cek toast error
 */
import { test, expect } from '@playwright/test';
import { loginViaAPI, setAuthInBrowser } from '../helpers/auth';

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:3001/api';

const RELAWAN_EMAIL    = process.env.TEST_RELAWAN_EMAIL    ?? 'relawan@pilar.id';
const RELAWAN_PASSWORD = process.env.TEST_RELAWAN_PASSWORD ?? 'relawan123';

const NEW_NAME = 'Nama Update Test';

test.describe('[PBI #8] Edit Profil Relawan', () => {

  // ──────────────────────────────────────────────────────────────────────────
  // TC.EditProfil.001 — Positif
  // Update nama profil berhasil: toast sukses muncul, form kembali view mode,
  // nama baru tampil di halaman.
  // ──────────────────────────────────────────────────────────────────────────
  test('[TC.EditProfil.001] Update profil dengan data valid berhasil tersimpan', async ({
    page,
    request,
  }) => {
    const { token, user } = await loginViaAPI(request, RELAWAN_EMAIL, RELAWAN_PASSWORD);

    // Simpan nama asli untuk cleanup setelah test
    const profileRes = await request.get(`${API_BASE}/users/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const { nama: originalName } = await profileRes.json();

    await page.goto('/');
    await setAuthInBrowser(page, token, user);

    try {
      // Navigasi ke /profile
      await page.goto('/profile');
      await page.waitForLoadState('networkidle');

      // Pastikan halaman profil termuat (section informasi profil tampil)
      await expect(page.getByText('Informasi Profil')).toBeVisible({ timeout: 8_000 });

      // Klik tombol 'Edit' untuk masuk ke mode edit
      await page.getByRole('button', { name: 'Edit' }).click();

      // Isi field 'Nama Lengkap' dengan nama baru
      const namaInput = page.locator('input.prof-input[type="text"]');
      await namaInput.clear();
      await namaInput.fill(NEW_NAME);

      // Klik tombol 'Simpan' (class: prof-btn-save)
      await page.locator('.prof-btn-save').click();

      // ── Assertions ──────────────────────────────────────────────────────
      // 1. Toast sukses 'Profil berhasil diperbarui' muncul
      await expect(page.getByText('Profil berhasil diperbarui')).toBeVisible({
        timeout: 8_000,
      });

      // 2. Form kembali ke view mode — tombol 'Edit' muncul kembali,
      //    tombol 'Simpan' dan 'Batal' hilang
      await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible({
        timeout: 5_000,
      });
      await expect(page.locator('.prof-btn-save')).not.toBeVisible();

      // 3. Nama terbaru tampil di halaman (card profil bagian atas)
      await expect(page.getByText(NEW_NAME).first()).toBeVisible();

    } finally {
      // Cleanup: kembalikan nama asli agar test lain tidak terdampak
      await request.patch(`${API_BASE}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { nama: originalName },
      });
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // TC.EditProfil.002 — Negatif
  // Ganti password dengan password lama yang salah → toast error muncul,
  // password tidak berubah.
  // ──────────────────────────────────────────────────────────────────────────
  test('[TC.EditProfil.002] Ganti password dengan password lama salah menampilkan error', async ({
    page,
    request,
  }) => {
    const { token, user } = await loginViaAPI(request, RELAWAN_EMAIL, RELAWAN_PASSWORD);
    await page.goto('/');
    await setAuthInBrowser(page, token, user);

    // Navigasi ke /settings
    await page.goto('/settings');

    // Tunggu form ganti password tersedia — lebih reliabel dari cek teks "Pengaturan"
    // yang bisa muncul di sidebar nav maupun h1 halaman.
    // Sekaligus memastikan halaman settings berhasil dimuat sepenuhnya.
    const passwordInputs = page.locator('input.input[type="password"]');
    await expect(passwordInputs.first()).toBeVisible({ timeout: 8_000 });
    await passwordInputs.nth(0).fill('salah999');       // password lama salah
    await passwordInputs.nth(1).fill('newpass123');     // password baru
    await passwordInputs.nth(2).fill('newpass123');     // konfirmasi

    // Klik tombol 'Ganti Password'
    await page.getByRole('button', { name: 'Ganti Password' }).click();

    // ── Assertions ──────────────────────────────────────────────────────────
    // 1. Toast error mengandung 'Password lama salah'
    //    (Backend 400: BadRequestException('Password lama salah'))
    await expect(page.getByText(/Password lama salah/i)).toBeVisible({
      timeout: 8_000,
    });

    // 2. User masih di /settings — tidak ada redirect
    expect(page.url()).toContain('/settings');

    // 3. Verifikasi password tidak berubah: login dengan password lama masih bisa
    const verifyRes = await request.post(`${API_BASE}/auth/login`, {
      data: { email: RELAWAN_EMAIL, password: RELAWAN_PASSWORD },
    });
    expect(verifyRes.ok()).toBeTruthy();
  });
});
