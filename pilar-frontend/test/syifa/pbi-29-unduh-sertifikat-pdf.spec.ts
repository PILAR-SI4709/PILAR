import { test, expect } from '@playwright/test';
import { loginViaAPI, setAuthInBrowser } from '../helpers/auth';

const RELAWAN_EMAIL    = process.env.TEST_RELAWAN_EMAIL    ?? 'relawan@pilar.id';
const RELAWAN_PASSWORD = process.env.TEST_RELAWAN_PASSWORD ?? 'relawan123';

const MOCK_PENDAFTARAN_DONE = [
  {
    id: 'pdft-s29-001',
    status: 'APPROVED',
    event: {
      id: 'ev-s29-001',
      judul: 'Bersih Pantai PDF Test',
      tanggal: '2026-06-01T07:00:00.000Z',
      lokasi: 'Pantai Anyer, Banten',
      status: 'DONE',
    },
  },
];

const MOCK_SERTIFIKAT = [
  {
    id: 'sert-s29-001',
    pendaftaranId: 'pdft-s29-001',
    nomorSertifikat: 'PILAR-2026-PDF-001',
    issuedAt: '2026-06-10T00:00:00.000Z',
    user: { nama: 'Relawan Test' },
    event: {
      judul: 'Bersih Pantai PDF Test',
      tanggal: '2026-06-01T07:00:00.000Z',
      lokasi: 'Pantai Anyer, Banten',
    },
  },
];

test.describe('[PBI #29] Generate dan Unduh Sertifikat PDF', () => {

  test('[TC.UnduhPDF.001] Klik "Ambil Sertifikat" menampilkan toast berhasil', async ({
    page,
    request,
  }) => {
    const { token, user } = await loginViaAPI(request, RELAWAN_EMAIL, RELAWAN_PASSWORD);
    await page.goto('/');
    await setAuthInBrowser(page, token, user);

    // Pendaftaran approved + event DONE, belum ada sertifikat
    await page.route(
      (url) => url.pathname === '/api/pendaftaran/my',
      (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_PENDAFTARAN_DONE) }),
    );
    await page.route(
      (url) => url.pathname === '/api/sertifikat/my',
      (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) }),
    );
    // Mock POST generate sertifikat
    await page.route(
      (url) => url.pathname.startsWith('/api/sertifikat/generate/'),
      (route) => route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_SERTIFIKAT[0]),
      }),
    );

    await page.goto('/sertifikat');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Sertifikat Saya')).toBeVisible({ timeout: 8_000 });

    // Tombol "Ambil Sertifikat" harus muncul (event DONE, belum ada sertifikat)
    const ambilBtn = page.getByRole('button', { name: /ambil sertifikat/i });
    await expect(ambilBtn).toBeVisible();
    await ambilBtn.click();

    // Toast sukses harus muncul
    await expect(page.getByText('Sertifikat berhasil dibuat!')).toBeVisible({ timeout: 10_000 });
  });

  test('[TC.UnduhPDF.002] Klik "Unduh PDF" memicu download file', async ({
    page,
    request,
  }) => {
    const { token, user } = await loginViaAPI(request, RELAWAN_EMAIL, RELAWAN_PASSWORD);
    await page.goto('/');
    await setAuthInBrowser(page, token, user);

    // Sertifikat sudah ada
    await page.route(
      (url) => url.pathname === '/api/pendaftaran/my',
      (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_PENDAFTARAN_DONE) }),
    );
    await page.route(
      (url) => url.pathname === '/api/sertifikat/my',
      (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_SERTIFIKAT) }),
    );

    await page.goto('/sertifikat');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Sertifikat Saya')).toBeVisible({ timeout: 8_000 });

    // Tombol "Unduh PDF" harus muncul (sertifikat sudah ada)
    const unduhBtn = page.getByRole('button', { name: /unduh pdf/i }).first();
    await expect(unduhBtn).toBeVisible();

    // Tunggu event download (pdf.save() dari jsPDF memicu browser download)
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 30_000 }),
      unduhBtn.click(),
    ]);

    // File yang diunduh harus berekstensi .pdf
    expect(download.suggestedFilename()).toMatch(/\.pdf$/i);
  });
});
