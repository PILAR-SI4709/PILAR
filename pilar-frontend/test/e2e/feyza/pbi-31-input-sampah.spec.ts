import { test, expect } from '@playwright/test';
import { loginViaAPI, setAuthInBrowser } from '../helpers/auth';

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:3001/api';

const ADMIN_EMAIL    = process.env.TEST_ADMIN_EMAIL    ?? 'admin@pilar.id';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD ?? 'admin123';

const MOCK_EVENT = {
  id: 'ev-feyza-31',
  judul: 'Bersih Pantai Test Feyza 31',
  lokasi: 'Pantai Test',
  tanggal: '2026-08-01T07:00:00.000Z',
  kuota: 20,
  status: 'DONE',
  relawanDiterima: 5,
};

test.describe('[PBI #31] Input Data Sampah Per Event', () => {

  test('[TC.InputSampah.001] Admin berhasil menambah data sampah melalui form', async ({
    page,
    request,
  }) => {
    const { token, user } = await loginViaAPI(request, ADMIN_EMAIL, ADMIN_PASSWORD);

    // Ambil event nyata dari API untuk mendapatkan ID valid
    const eventsRes = await request.get(`${API_BASE}/events`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const events = await eventsRes.json();
    // Gunakan event pertama, atau fallback ke mock jika kosong
    const eventId = events.length > 0 ? events[0].id : MOCK_EVENT.id;

    await page.goto('/');
    await setAuthInBrowser(page, token, user);

    // Mock endpoint event detail
    await page.route(
      (url) => url.pathname === `/api/events/${eventId}`,
      (route) => route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ...MOCK_EVENT, id: eventId }),
      }),
    );
    await page.route(
      (url) => url.pathname === `/api/sampah/event/${eventId}`,
      (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [] }) }),
    );
    await page.route(
      (url) => url.pathname === `/api/dokumentasi/event/${eventId}`,
      (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) }),
    );

    // Mock POST sampah — sukses
    await page.route(
      (url) => url.pathname === '/api/sampah',
      (route) => route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'sampah-001', jenis: 'Plastik', jumlahKg: 5 }),
      }),
    );

    await page.goto(`/dashboard/admin/events/${eventId}/laporan`);
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Input Data Sampah')).toBeVisible({ timeout: 8_000 });

    // Form input sampah
    const jenisSelect = page.locator('select.input');
    await jenisSelect.selectOption('Plastik');

    const jumlahInput = page.locator('input.input[type="number"]');
    await jumlahInput.fill('5');

    // Klik "Tambah Data"
    await page.getByRole('button', { name: 'Tambah Data' }).click();

    // Toast sukses harus muncul
    await expect(page.getByText('Data sampah ditambahkan!')).toBeVisible({ timeout: 8_000 });
  });

  test('[TC.InputSampah.002] Submit dengan jumlah kosong menampilkan pesan error', async ({
    page,
    request,
  }) => {
    const { token, user } = await loginViaAPI(request, ADMIN_EMAIL, ADMIN_PASSWORD);

    const eventsRes = await request.get(`${API_BASE}/events`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const events = await eventsRes.json();
    const eventId = events.length > 0 ? events[0].id : MOCK_EVENT.id;

    await page.goto('/');
    await setAuthInBrowser(page, token, user);

    await page.route(
      (url) => url.pathname === `/api/events/${eventId}`,
      (route) => route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ...MOCK_EVENT, id: eventId }),
      }),
    );
    await page.route(
      (url) => url.pathname === `/api/sampah/event/${eventId}`,
      (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [] }) }),
    );
    await page.route(
      (url) => url.pathname === `/api/dokumentasi/event/${eventId}`,
      (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) }),
    );

    await page.goto(`/dashboard/admin/events/${eventId}/laporan`);
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Input Data Sampah')).toBeVisible({ timeout: 8_000 });

    // Klik "Tambah Data" tanpa mengisi jumlah
    const jumlahInput = page.locator('input.input[type="number"]');
    await jumlahInput.fill('');
    await page.getByRole('button', { name: 'Tambah Data' }).click();

    // Harus muncul pesan error (toast error atau validasi)
    await expect(page.getByText(/masukkan jumlah sampah yang valid/i)).toBeVisible({ timeout: 8_000 });
  });
});
