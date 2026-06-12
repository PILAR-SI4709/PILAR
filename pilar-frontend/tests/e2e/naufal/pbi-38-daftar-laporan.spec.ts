import { test, expect } from "@playwright/test";
import { loginViaAPI, setAuthInBrowser } from "../helpers/auth";

const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL ?? "admin@pilar.id";
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD ?? "admin123";

const MOCK_LAPORAN_LIST = [
  {
    id: "ev-n38-001",
    judul: "Bersih Pantai Laporan Test",
    lokasi: "Pantai Laporan, Jawa Barat",
    tanggal: "2026-06-10T07:00:00.000Z",
    status: "DONE",
    _count: { pendaftaran: 12, sampah: 4, dokumentasi: 6 },
  },
  {
    id: "ev-n38-002",
    judul: "Clean Up Pantai Berlangsung",
    lokasi: "Pantai Barat",
    tanggal: "2026-08-20T07:00:00.000Z",
    status: "ONGOING",
    _count: { pendaftaran: 7, sampah: 0, dokumentasi: 2 },
  },
];

test.describe("[PBI #38] Daftar Laporan Kegiatan Admin", () => {
  test('[TC.DaftarLaporan.001] Halaman /dashboard/admin/laporan menampilkan heading "Laporan Kegiatan"', async ({
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
      (url) => url.pathname === "/api/laporan",
      (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(MOCK_LAPORAN_LIST),
        }),
    );

    await page.goto("/dashboard/admin/laporan");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("Laporan Kegiatan")).toBeVisible({
      timeout: 8_000,
    });
  });

  test("[TC.DaftarLaporan.002] Setiap event menampilkan jumlah relawan dan jumlah foto", async ({
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
      (url) => url.pathname === "/api/laporan",
      (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(MOCK_LAPORAN_LIST),
        }),
    );

    await page.goto("/dashboard/admin/laporan");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("Laporan Kegiatan")).toBeVisible({
      timeout: 8_000,
    });

    // Judul event pertama harus tampil
    await expect(page.getByText(MOCK_LAPORAN_LIST[0].judul)).toBeVisible();

    // Info relawan dan foto harus ada (menggunakan _count)
    await expect(page.getByText(/12 relawan/i)).toBeVisible();
    await expect(page.getByText(/6 foto/i)).toBeVisible();
  });

  test('[TC.DaftarLaporan.003] Tautan "Lihat Laporan" mengarah ke halaman detail laporan', async ({
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
      (url) => url.pathname === "/api/laporan",
      (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(MOCK_LAPORAN_LIST),
        }),
    );

    await page.goto("/dashboard/admin/laporan");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("Laporan Kegiatan")).toBeVisible({
      timeout: 8_000,
    });

    // Klik "Lihat Laporan" pada event pertama
    const lihatBtn = page.getByRole("link", { name: /lihat laporan/i }).first();
    await expect(lihatBtn).toBeVisible();
    await lihatBtn.click();

    // Harus mengarah ke /laporan/:id
    await page.waitForURL((url) => url.pathname.startsWith("/laporan/"), {
      timeout: 8_000,
    });
    expect(page.url()).toContain("/laporan/");
  });
});
