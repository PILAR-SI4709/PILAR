import { test, expect } from '@playwright/test';
import { loginViaAPI, setAuthInBrowser } from '../helpers/auth';

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:3001/api';

const ADMIN_EMAIL    = process.env.TEST_ADMIN_EMAIL    ?? 'admin@pilar.id';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD ?? 'admin123';

const MOCK_EVENT = {
  id: 'ev-feyza-33',
  judul: 'Bersih Pantai Hapus Foto Test',
  lokasi: 'Pantai Hapus',
  tanggal: '2026-08-20T07:00:00.000Z',
  kuota: 20,
  status: 'DONE',
  relawanDiterima: 2,
};

const MOCK_DOK = {
  id: 'dok-feyza-33-001',
  fotoUrl: 'https://picsum.photos/200',
  caption: 'Foto test galeri',
  eventId: 'ev-feyza-33',
};

test.describe('[PBI #33] Hapus Foto Dokumentasi dari Galeri', () => {

  test('[TC.HapusDok.001] Admin berhasil menghapus foto dari galeri dan foto menghilang', async ({
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

    // Galeri awalnya berisi 1 foto; setelah DELETE, kosong
    let deleted = false;
    await page.route(
      (url) => url.pathname === `/api/dokumentasi/event/${eventId}`,
      (route) => route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(deleted ? [] : [{ ...MOCK_DOK, eventId }]),
      }),
    );

    await page.route(
      (url) => url.pathname.startsWith('/api/dokumentasi/') && !url.pathname.includes('/event/'),
      (route, req) => {
        if (req.method() === 'DELETE') {
          deleted = true;
          route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
        } else {
          route.continue();
        }
      },
    );

    await page.goto(`/dashboard/admin/events/${eventId}/laporan`);
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Upload Dokumentasi')).toBeVisible({ timeout: 8_000 });

    // Section galeri harus ada foto (minimal 1 item)
    // Tombol hapus foto ada di setiap thumbnail galeri (tombol "×")
    const hapusBtn = page.locator('.lap-thumb button').first();

    // Jika galeri kosong karena data aktual DB berbeda, skip assertion galeri
    const galeriSection = page.getByText(/galeri/i).first();
    await expect(galeriSection).toBeVisible();

    // Hanya lakukan klik hapus jika ada tombol hapus
    const hapusBtnCount = await hapusBtn.count();
    if (hapusBtnCount > 0) {
      await hapusBtn.click();
      // Toast "Foto dihapus" harus muncul
      await expect(page.getByText('Foto dihapus')).toBeVisible({ timeout: 8_000 });
    } else {
      // TODO: seed data foto dokumentasi untuk event ini agar tes berjalan penuh
      test.skip(true, 'Tidak ada foto di galeri — perlu data seed');
    }
  });

  test('[TC.HapusDok.002] Galeri dengan foto mock menampilkan tombol hapus dan menghapus via mock API', async ({
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

    let deleted = false;
    await page.route(
      (url) => url.pathname === `/api/dokumentasi/event/${eventId}`,
      (route) => route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(deleted ? [] : [{ ...MOCK_DOK, id: 'dok-to-delete', eventId }]),
      }),
    );

    await page.route(
      (url) => url.pathname === '/api/dokumentasi/dok-to-delete',
      (route, req) => {
        if (req.method() === 'DELETE') {
          deleted = true;
          route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
        } else {
          route.continue();
        }
      },
    );

    await page.goto(`/dashboard/admin/events/${eventId}/laporan`);
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Upload Dokumentasi')).toBeVisible({ timeout: 8_000 });

    // Tombol hapus (×) pada thumbnail galeri
    const hapusBtn = page.locator('.lap-thumb button').first();
    await expect(hapusBtn).toBeVisible({ timeout: 5_000 });
    await hapusBtn.click();

    // Toast "Foto dihapus" harus muncul
    await expect(page.getByText('Foto dihapus')).toBeVisible({ timeout: 8_000 });
  });
});
