import { test, expect } from '@playwright/test';
import { loginViaAPI, setAuthInBrowser } from '../helpers/auth';

const RELAWAN_EMAIL    = process.env.TEST_RELAWAN_EMAIL    ?? 'relawan@pilar.id';
const RELAWAN_PASSWORD = process.env.TEST_RELAWAN_PASSWORD ?? 'relawan123';

// Dua pendaftaran: satu event DONE (berhak sertifikat), satu UPCOMING (belum selesai)
const MOCK_PENDAFTARAN = [
  {
    id: 'pdft-m34-done',
    status: 'APPROVED',
    event: {
      id: 'ev-m34-done',
      judul: 'Bersih Pantai Selesai Test',
      tanggal: '2026-05-01T07:00:00.000Z',
      lokasi: 'Pantai Selatan',
      status: 'DONE',
    },
  },
  {
    id: 'pdft-m34-upcoming',
    status: 'APPROVED',
    event: {
      id: 'ev-m34-upcoming',
      judul: 'Bersih Pantai Mendatang Test',
      tanggal: '2026-10-01T07:00:00.000Z',
      lokasi: 'Pantai Utara',
      status: 'UPCOMING',
    },
  },
];

test.describe('[PBI #34] Sertifikat Otomatis Berdasarkan Status Event', () => {

  test('[TC.SertOtomatis.001] Event berstatus DONE tanpa sertifikat menampilkan tombol "Ambil Sertifikat"', async ({
    page,
    request,
  }) => {
    const { token, user } = await loginViaAPI(request, RELAWAN_EMAIL, RELAWAN_PASSWORD);
    await page.goto('/');
    await setAuthInBrowser(page, token, user);

    await page.route(
      (url) => url.pathname === '/api/pendaftaran/my',
      (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_PENDAFTARAN) }),
    );
    await page.route(
      (url) => url.pathname === '/api/sertifikat/my',
      (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) }),
    );

    await page.goto('/sertifikat');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Sertifikat Saya')).toBeVisible({ timeout: 8_000 });

    // Event DONE tanpa sertifikat → tombol "Ambil Sertifikat"
    await expect(page.getByRole('button', { name: /ambil sertifikat/i })).toBeVisible();
  });

  test('[TC.SertOtomatis.002] Event yang belum selesai menampilkan label "Event belum selesai"', async ({
    page,
    request,
  }) => {
    const { token, user } = await loginViaAPI(request, RELAWAN_EMAIL, RELAWAN_PASSWORD);
    await page.goto('/');
    await setAuthInBrowser(page, token, user);

    await page.route(
      (url) => url.pathname === '/api/pendaftaran/my',
      (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_PENDAFTARAN) }),
    );
    await page.route(
      (url) => url.pathname === '/api/sertifikat/my',
      (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) }),
    );

    await page.goto('/sertifikat');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Sertifikat Saya')).toBeVisible({ timeout: 8_000 });

    // Event UPCOMING → label "Event belum selesai"
    await expect(page.getByText('Event belum selesai')).toBeVisible();
  });

  test('[TC.SertOtomatis.003] Event DONE dengan sertifikat menampilkan tombol "Unduh PDF"', async ({
    page,
    request,
  }) => {
    const { token, user } = await loginViaAPI(request, RELAWAN_EMAIL, RELAWAN_PASSWORD);
    await page.goto('/');
    await setAuthInBrowser(page, token, user);

    const MOCK_SERTIFIKAT = [{
      id: 'sert-m34-001',
      pendaftaranId: 'pdft-m34-done',
      nomorSertifikat: 'PILAR-M34-001',
      issuedAt: '2026-05-10T00:00:00.000Z',
    }];

    await page.route(
      (url) => url.pathname === '/api/pendaftaran/my',
      (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_PENDAFTARAN) }),
    );
    await page.route(
      (url) => url.pathname === '/api/sertifikat/my',
      (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_SERTIFIKAT) }),
    );

    await page.goto('/sertifikat');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Sertifikat Saya')).toBeVisible({ timeout: 8_000 });

    // Sertifikat sudah ada → tombol "Unduh PDF"
    await expect(page.getByRole('button', { name: /unduh pdf/i }).first()).toBeVisible();
  });
});
