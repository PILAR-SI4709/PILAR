import { test, expect } from '@playwright/test';
import { loginViaAPI, setAuthInBrowser } from '../helpers/auth';

const ADMIN_EMAIL    = process.env.TEST_ADMIN_EMAIL    ?? 'admin@pilar.id';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD ?? 'admin123';

const MOCK_EVENTS = [
  {
    id: 'ev-m35-001',
    judul: 'Bersih Pantai Hub Test',
    lokasi: 'Pantai Hub',
    tanggal: '2026-09-01T07:00:00.000Z',
    kuota: 30,
    status: 'UPCOMING',
    _count: { pendaftaran: 8 },
  },
];

const MOCK_PESERTA = [
  {
    id: 'pdft-m35-001',
    userId: 'relawan-id',
    eventId: 'ev-m35-001',
    status: 'PENDING',
    nik: '3201111111110001',
    noHp: '081200000001',
    tanggalLahir: '2000-01-01T00:00:00.000Z',
    motivasi: 'Ingin berkontribusi menjaga kebersihan pantai.',
    kesehatan: { tidakAdaPenyakitJantung: true, bisaBerjalanJauh: true },
    user: { id: 'relawan-id', nama: 'Relawan Hub Test', email: 'relawan@pilar.id' },
  },
];

test.describe('[PBI #35] Hub Manajemen & Verifikasi Relawan Admin', () => {

  test('[TC.HubRelawan.001] Halaman /dashboard/admin/relawan menampilkan heading "Verifikasi Relawan"', async ({
    page,
    request,
  }) => {
    const { token, user } = await loginViaAPI(request, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.goto('/');
    await setAuthInBrowser(page, token, user);

    await page.route(
      (url) => url.pathname === '/api/events',
      (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_EVENTS) }),
    );
    await page.route(
      (url) => url.pathname.startsWith('/api/pendaftaran/event/'),
      (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_PESERTA) }),
    );

    await page.goto('/dashboard/admin/relawan');
    await page.waitForLoadState('networkidle');

    // Heading "Verifikasi Relawan" harus tampil
    await expect(page.getByText('Verifikasi Relawan')).toBeVisible({ timeout: 8_000 });
  });

  test('[TC.HubRelawan.002] Daftar event tampil dengan jumlah pendaftar', async ({
    page,
    request,
  }) => {
    const { token, user } = await loginViaAPI(request, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.goto('/');
    await setAuthInBrowser(page, token, user);

    await page.route(
      (url) => url.pathname === '/api/events',
      (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_EVENTS) }),
    );
    await page.route(
      (url) => url.pathname.startsWith('/api/pendaftaran/event/'),
      (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_PESERTA) }),
    );

    await page.goto('/dashboard/admin/relawan');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Verifikasi Relawan')).toBeVisible({ timeout: 8_000 });

    // Nama event harus tampil di kolom kiri (span dalam button list — first() karena h2 panel kanan juga memuat judul sama)
    await expect(page.getByText(MOCK_EVENTS[0].judul).first()).toBeVisible();

    // Info jumlah pendaftar harus ada
    await expect(page.getByText(/pendaftar/i).first()).toBeVisible();
  });

  test('[TC.HubRelawan.003] Memilih event menampilkan detail pendaftar di panel kanan', async ({
    page,
    request,
  }) => {
    const { token, user } = await loginViaAPI(request, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.goto('/');
    await setAuthInBrowser(page, token, user);

    await page.route(
      (url) => url.pathname === '/api/events',
      (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_EVENTS) }),
    );
    await page.route(
      (url) => url.pathname.startsWith('/api/pendaftaran/event/'),
      (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_PESERTA) }),
    );

    await page.goto('/dashboard/admin/relawan');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Verifikasi Relawan')).toBeVisible({ timeout: 8_000 });

    // Klik event pertama di daftar kiri
    await page.getByText(MOCK_EVENTS[0].judul).first().click();

    // Panel kanan menampilkan nama relawan (peserta terdaftar)
    await expect(page.getByText(MOCK_PESERTA[0].user.nama)).toBeVisible({ timeout: 5_000 });
  });
});
