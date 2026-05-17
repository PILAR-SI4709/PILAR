/**
 * Helper autentikasi untuk Playwright E2E test PILAR.
 *
 * Cara inject token ke browser (tanpa login via UI):
 *   const { token, user } = await loginViaAPI(request, email, password);
 *   await page.goto('/');
 *   await setAuthInBrowser(page, token, user);
 *   await page.goto('/dashboard'); // localStorage sudah ada token
 */
import { APIRequestContext, Page } from '@playwright/test';

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:3001/api';

export interface AuthUser {
  id: string;
  nama: string;
  email: string;
  role: 'USER' | 'ADMIN';
  foto?: string;
}

export interface LoginResult {
  token: string;
  user: AuthUser;
}

/** Login via API langsung (lebih cepat dari UI login) */
export async function loginViaAPI(
  request: APIRequestContext,
  email: string,
  password: string,
): Promise<LoginResult> {
  const res = await request.post(`${API_BASE}/auth/login`, {
    data: { email, password },
  });
  if (!res.ok()) {
    throw new Error(`Login gagal [${res.status()}]: ${await res.text()}`);
  }
  const { access_token, user } = await res.json();
  return { token: access_token, user };
}

/**
 * Inject token & user ke localStorage dan cookie browser.
 * Panggil SETELAH page.goto('/') agar origin sudah tersedia.
 * Setelah ini langsung goto ke halaman target.
 */
export async function setAuthInBrowser(
  page: Page,
  token: string,
  user: AuthUser,
): Promise<void> {
  await page.evaluate(
    ({ t, u }) => {
      localStorage.setItem('pilar_token', t);
      localStorage.setItem('pilar_user', JSON.stringify(u));
      document.cookie = `pilar_token=${t}; path=/; max-age=604800; SameSite=Lax`;
    },
    { t: token, u: user },
  );
}

/** Hapus semua auth dari browser (simulasi logout atau kondisi tanpa sesi) */
export async function clearAuthInBrowser(page: Page): Promise<void> {
  await page.evaluate(() => {
    localStorage.removeItem('pilar_token');
    localStorage.removeItem('pilar_user');
    document.cookie = 'pilar_token=; path=/; max-age=0';
  });
}

export async function getEventsViaAPI(
  request: APIRequestContext,
  token: string,
): Promise<any[]> {
  const res = await request.get(`${API_BASE}/events`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok()) return [];
  return res.json();
}

export async function createEventViaAPI(
  request: APIRequestContext,
  token: string,
  payload: {
    judul: string;
    deskripsi: string;
    lokasi: string;
    tanggal: string;
    kuota: number;
  },
): Promise<any> {
  const res = await request.post(`${API_BASE}/events`, {
    headers: { Authorization: `Bearer ${token}` },
    data: payload,
  });
  if (!res.ok()) throw new Error(`Gagal membuat event: ${await res.text()}`);
  return res.json();
}

export async function deleteEventViaAPI(
  request: APIRequestContext,
  token: string,
  eventId: string,
): Promise<void> {
  await request.delete(`${API_BASE}/events/${eventId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
