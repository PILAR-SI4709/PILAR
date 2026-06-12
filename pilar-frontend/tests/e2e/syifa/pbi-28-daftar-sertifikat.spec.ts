import { test, expect } from '@playwright/test';
import { loginViaAPI, setAuthInBrowser } from '../helpers/auth';

const RELAWAN_EMAIL    = process.env.TEST_RELAWAN_EMAIL    ?? 'relawan@pilar.id';
const RELAWAN_PASSWORD = process.env.TEST_RELAWAN_PASSWORD ?? 'relawan123';

const MOCK_PENDAFTARAN = [
  {
    id: 'pdft-s28-001',
    status: 'APPROVED',
    event: {
      id: 'ev-s28-001',
      judul: 'Bersih Pantai Syifa Test',
      tanggal: '2026-07-15T07:00:00.000Z',
      lokasi: 'Pantai Kartini, Jepara',
      status: 'DONE',
    },
  },
];

const MOCK_SERTIFIKAT = [
  {
    id: 'sert-s28-001',
    pendaftaranId: 'pdft-s28-001',
    nomorSertifikat: 'PILAR-2026-001',
    issuedAt: '2026-07-20T00:00:00.000Z',
    event: {
      judul: 'Bersih Pantai Syifa Test',
      tanggal: '2026-07-15T07:00:00.000Z',
      lokasi: 'Pantai Kartini, Jepara',
    },
  },
];

test.describe('[PBI #28] Daftar Sertifikat Relawan', () => {

  test('[TC.DaftarSert.001] Halaman /sertifikat menampilkan judul "Sertifikat Saya"', async ({
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
      (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_SERTIFIKAT) }),
    );

    await page.goto('/sertifikat');
    await page.waitForLoadState('networkidle');

    // Heading "Sertifikat Saya" harus tampil
    await expect(page.getByText('Sertifikat Saya')).toBeVisible({ timeout: 8_000 });
  });

  test('[TC.DaftarSert.002] Kartu sertifikat berisi judul event, tanggal, dan lokasi', async ({
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
      (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_SERTIFIKAT) }),
    );

    await page.goto('/sertifikat');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Sertifikat Saya')).toBeVisible({ timeout: 8_000 });

    // Kartu harus menampilkan judul event
    await expect(page.getByText(MOCK_PENDAFTARAN[0].event.judul)).toBeVisible();

    // Lokasi event harus tampil
    await expect(page.getByText(MOCK_PENDAFTARAN[0].event.lokasi)).toBeVisible();

    // Nomor sertifikat tampil
    await expect(page.getByText(MOCK_SERTIFIKAT[0].nomorSertifikat)).toBeVisible();
  });

  test('[TC.DaftarSert.003] Empty state tampil ketika tidak ada pendaftaran yang disetujui', async ({
    page,
    request,
  }) => {
    const { token, user } = await loginViaAPI(request, RELAWAN_EMAIL, RELAWAN_PASSWORD);
    await page.goto('/');
    await setAuthInBrowser(page, token, user);

    await page.route(
      (url) => url.pathname === '/api/pendaftaran/my',
      (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) }),
    );
    await page.route(
      (url) => url.pathname === '/api/sertifikat/my',
      (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) }),
    );

    await page.goto('/sertifikat');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Sertifikat Saya')).toBeVisible({ timeout: 8_000 });
    await expect(page.getByText('Belum ada sertifikat')).toBeVisible();
  });
});
