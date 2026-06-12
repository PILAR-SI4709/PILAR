import { test, expect } from '@playwright/test';
import { loginViaAPI, setAuthInBrowser } from '../helpers/auth';

const ADMIN_EMAIL    = process.env.TEST_ADMIN_EMAIL    ?? 'admin@pilar.id';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD ?? 'admin123';

const MOCK_EVENT = {
  id: 'ev-m37-001',
  judul: 'Bersih Pantai Detail Peserta Test',
  lokasi: 'Pantai Detail',
  tanggal: '2026-09-10T07:00:00.000Z',
  kuota: 25,
  status: 'UPCOMING',
  _count: { pendaftaran: 1 },
};

const MOCK_PESERTA = [
  {
    id: 'pdft-m37-001',
    userId: 'relawan-m37',
    eventId: 'ev-m37-001',
    status: 'PENDING',
    nik: '3271234567890001',
    noHp: '081298765432',
    tanggalLahir: '1999-05-20T00:00:00.000Z',
    motivasi: 'Sangat ingin menjaga kelestarian lingkungan laut.',
    kesehatan: {
      tidakAdaPenyakitJantung: true,
      tidakAdaAsma: true,
      bisaBerjalanJauh: true,
      tidakAlergiLaut: true,
      tidakHamilAtauMenyusui: true,
    },
    user: { id: 'relawan-m37', nama: 'Peserta Detail Test', email: 'peserta.detail@pilar.id' },
  },
];

test.describe('[PBI #37] Detail Data Peserta di Hub Relawan', () => {

  test('[TC.DetailPeserta.001] Kartu peserta menampilkan NIK, No. HP, Tgl. Lahir, dan Motivasi', async ({
    page,
    request,
  }) => {
    const { token, user } = await loginViaAPI(request, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.goto('/');
    await setAuthInBrowser(page, token, user);

    await page.route(
      (url) => url.pathname === '/api/events',
      (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([MOCK_EVENT]) }),
    );
    await page.route(
      (url) => url.pathname.startsWith('/api/pendaftaran/event/'),
      (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_PESERTA) }),
    );

    await page.goto('/dashboard/admin/relawan');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Verifikasi Relawan')).toBeVisible({ timeout: 8_000 });

    // Pilih event (auto-pilih event pertama yang punya PENDING)
    await expect(page.getByText(MOCK_EVENT.judul).first()).toBeVisible({ timeout: 5_000 });

    // Label NIK harus tampil di kartu peserta
    await expect(page.getByText('NIK')).toBeVisible();

    // Label No. HP harus tampil
    await expect(page.getByText('No. HP')).toBeVisible();

    // Label Tgl. Lahir harus tampil
    await expect(page.getByText('Tgl. Lahir')).toBeVisible();

    // Label Motivasi harus tampil
    await expect(page.getByText('Motivasi')).toBeVisible();
  });

  test('[TC.DetailPeserta.002] Nilai NIK, No. HP, dan motivasi sesuai data pendaftar', async ({
    page,
    request,
  }) => {
    const { token, user } = await loginViaAPI(request, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.goto('/');
    await setAuthInBrowser(page, token, user);

    await page.route(
      (url) => url.pathname === '/api/events',
      (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([MOCK_EVENT]) }),
    );
    await page.route(
      (url) => url.pathname.startsWith('/api/pendaftaran/event/'),
      (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_PESERTA) }),
    );

    await page.goto('/dashboard/admin/relawan');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Verifikasi Relawan')).toBeVisible({ timeout: 8_000 });
    await expect(page.getByText(MOCK_EVENT.judul).first()).toBeVisible({ timeout: 5_000 });

    // Nilai NIK dari mock harus tampil
    await expect(page.getByText(MOCK_PESERTA[0].nik)).toBeVisible();

    // Nilai No. HP dari mock harus tampil
    await expect(page.getByText(MOCK_PESERTA[0].noHp)).toBeVisible();

    // Teks motivasi dari mock harus tampil
    await expect(page.getByText(MOCK_PESERTA[0].motivasi)).toBeVisible();
  });
});
