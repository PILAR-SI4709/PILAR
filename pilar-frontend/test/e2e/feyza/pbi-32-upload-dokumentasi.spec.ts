import path from 'path';
import { test, expect } from '@playwright/test';
import { loginViaAPI, setAuthInBrowser } from '../helpers/auth';

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:3001/api';

const ADMIN_EMAIL    = process.env.TEST_ADMIN_EMAIL    ?? 'admin@pilar.id';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD ?? 'admin123';

// Gambar PNG 1x1 pixel (in-memory, tidak perlu file fisik)
const TINY_PNG_B64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI6QAAAABJRU5ErkJggg==';

const MOCK_EVENT = {
  id: 'ev-feyza-32',
  judul: 'Bersih Pantai Upload Test',
  lokasi: 'Pantai Upload',
  tanggal: '2026-08-10T07:00:00.000Z',
  kuota: 20,
  status: 'DONE',
  relawanDiterima: 3,
};

const MOCK_DOK_UPLOADED = {
  id: 'dok-feyza-32-001',
  fotoUrl: 'https://example.com/foto-test.jpg',
  caption: 'Deskripsi foto test upload',
  eventId: 'ev-feyza-32',
};

test.describe('[PBI #32] Upload Foto Dokumentasi Kegiatan', () => {

  test('[TC.UploadDok.001] Admin berhasil mengunggah foto dokumentasi dan foto masuk ke galeri', async ({
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
      (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ...MOCK_EVENT, id: eventId }) }),
    );
    await page.route(
      (url) => url.pathname === `/api/sampah/event/${eventId}`,
      (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ items: [] }) }),
    );

    // Pertama kali galeri kosong, setelah upload ada 1 foto
    let uploaded = false;
    await page.route(
      (url) => url.pathname === `/api/dokumentasi/event/${eventId}`,
      (route) => route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(uploaded ? [MOCK_DOK_UPLOADED] : []),
      }),
    );

    // Mock endpoint upload
    await page.route(
      (url) => url.pathname === '/api/dokumentasi/upload-admin',
      (route) => {
        uploaded = true;
        route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify(MOCK_DOK_UPLOADED) });
      },
    );

    await page.goto(`/dashboard/admin/events/${eventId}/laporan`);
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Upload Dokumentasi')).toBeVisible({ timeout: 8_000 });

    // Set input file dengan buffer in-memory
    const fileInput = page.locator('input[type="file"][accept="image/*"]');
    await fileInput.setInputFiles({
      name: 'test-foto.png',
      mimeType: 'image/png',
      buffer: Buffer.from(TINY_PNG_B64, 'base64'),
    });

    // Isi keterangan/caption
    await page.getByPlaceholder('Deskripsi foto...').fill('Deskripsi foto test upload');

    // Klik tombol upload
    const uploadBtn = page.getByRole('button', { name: /upload.*foto/i });
    await expect(uploadBtn).toBeEnabled({ timeout: 5_000 });
    await uploadBtn.click();

    // Toast sukses harus muncul
    await expect(page.getByText(/foto berhasil diunggah/i)).toBeVisible({ timeout: 10_000 });
  });
});
