import { test, expect } from "@playwright/test";
import { loginViaAPI, setAuthInBrowser } from "../helpers/auth";

const API_BASE = process.env.API_BASE_URL ?? "http://localhost:3001/api";

const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL ?? "admin@pilar.id";
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD ?? "admin123";

const EVENT_ID = "ev-n39-001";

const MOCK_LAPORAN_DETAIL = {
  event: {
    id: EVENT_ID,
    judul: "Bersih Pantai Detail Laporan Test",
    lokasi: "Pantai Detail Naufal",
    tanggal: "2026-05-20T07:00:00.000Z",
    deskripsi: "Kegiatan pembersihan pantai kolaborasi komunitas.",
    status: "DONE",
  },
  ringkasan: {
    totalPeserta: 18,
    totalDokumentasi: 5,
    totalSampahKg: 72,
  },
  peserta: [],
  sampah: [
    { id: "s1", jenis: "Plastik", jumlahKg: 40 },
    { id: "s2", jenis: "Organik", jumlahKg: 32 },
  ],
  dokumentasi: [
    {
      id: "d1",
      fotoUrl: "https://picsum.photos/200",
      caption: "Foto kegiatan 1",
    },
    {
      id: "d2",
      fotoUrl: "https://picsum.photos/201",
      caption: "Foto kegiatan 2",
    },
  ],
};

test.describe("[PBI #39] Detail Laporan Kegiatan Event", () => {
  test("[TC.DetailLaporan.001] Halaman detail laporan menampilkan ringkasan Peserta Hadir, Foto Dokumentasi, Sampah (kg)", async ({
    page,
    request,
  }) => {
    const { token, user } = await loginViaAPI(
      request,
      ADMIN_EMAIL,
      ADMIN_PASSWORD,
    );
    await page.goto("/");
    await setAuthInBrowser(page, token, user);

    await page.route(
      (url) => url.pathname === `/api/laporan/${EVENT_ID}`,
      (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(MOCK_LAPORAN_DETAIL),
        }),
    );

    await page.goto(`/laporan/${EVENT_ID}`);
    await page.waitForLoadState("networkidle");

    await expect(page.getByText(MOCK_LAPORAN_DETAIL.event.judul)).toBeVisible({
      timeout: 8_000,
    });

    // Kartu ringkasan harus ada
    await expect(page.getByText("Peserta Hadir")).toBeVisible();
    await expect(page.getByText("Foto Dokumentasi")).toBeVisible();
    await expect(page.getByText("Sampah (kg)")).toBeVisible();

    // Nilai ringkasan harus sesuai mock
    await expect(
      page.getByText(String(MOCK_LAPORAN_DETAIL.ringkasan.totalPeserta)),
    ).toBeVisible();
    await expect(
      page.getByText(String(MOCK_LAPORAN_DETAIL.ringkasan.totalDokumentasi)),
    ).toBeVisible();
  });

  test('[TC.DetailLaporan.002] Bagian "Rincian Sampah" menampilkan data sampah per jenis', async ({
    page,
    request,
  }) => {
    const { token, user } = await loginViaAPI(
      request,
      ADMIN_EMAIL,
      ADMIN_PASSWORD,
    );
    await page.goto("/");
    await setAuthInBrowser(page, token, user);

    await page.route(
      (url) => url.pathname === `/api/laporan/${EVENT_ID}`,
      (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(MOCK_LAPORAN_DETAIL),
        }),
    );

    await page.goto(`/laporan/${EVENT_ID}`);
    await page.waitForLoadState("networkidle");

    await expect(page.getByText(MOCK_LAPORAN_DETAIL.event.judul)).toBeVisible({
      timeout: 8_000,
    });

    // Bagian "Rincian Sampah" harus tampil
    await expect(page.getByText("Rincian Sampah")).toBeVisible();

    // Jenis sampah dari mock harus ada
    await expect(page.getByText("Plastik")).toBeVisible();
    await expect(page.getByText("Organik")).toBeVisible();
  });

  test('[TC.DetailLaporan.003] Bagian "Galeri Dokumentasi" menampilkan foto kegiatan', async ({
    page,
    request,
  }) => {
    const { token, user } = await loginViaAPI(
      request,
      ADMIN_EMAIL,
      ADMIN_PASSWORD,
    );
    await page.goto("/");
    await setAuthInBrowser(page, token, user);

    await page.route(
      (url) => url.pathname === `/api/laporan/${EVENT_ID}`,
      (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(MOCK_LAPORAN_DETAIL),
        }),
    );

    await page.goto(`/laporan/${EVENT_ID}`);
    await page.waitForLoadState("networkidle");

    await expect(page.getByText(MOCK_LAPORAN_DETAIL.event.judul)).toBeVisible({
      timeout: 8_000,
    });

    // Bagian "Galeri Dokumentasi" harus tampil
    await expect(page.getByText("Galeri Dokumentasi")).toBeVisible();

    // Gambar dokumentasi harus ada
    const images = page.locator(".lapd-thumb");
    await expect(images.first()).toBeVisible({ timeout: 5_000 });
  });
});
