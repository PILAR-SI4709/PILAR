import { test, expect } from "@playwright/test";
import { loginViaAPI, setAuthInBrowser } from "../helpers/auth";

const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL ?? "admin@pilar.id";
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD ?? "admin123";
const RELAWAN_EMAIL = process.env.TEST_RELAWAN_EMAIL ?? "relawan@pilar.id";
const RELAWAN_PASSWORD = process.env.TEST_RELAWAN_PASSWORD ?? "relawan123";

const MOCK_REKAP = {
  totalSampahKg: 1250,
  totalRelawanAktif: 87,
  totalEventSelesai: 14,
};

test.describe("[PBI #40] Rekap Statistik Keseluruhan Program", () => {
  test('[TC.RekapStatistik.001] Halaman /dashboard/admin/monitoring menampilkan judul "Rekap Statistik Keseluruhan"', async ({
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
      (url) => url.pathname === "/api/events/rekap",
      (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(MOCK_REKAP),
        }),
    );

    await page.goto("/dashboard/admin/monitoring");
    await page.waitForLoadState("networkidle");

    // Heading halaman
    await expect(page.getByText("Rekap Statistik Keseluruhan")).toBeVisible({
      timeout: 8_000,
    });
  });

  test('[TC.RekapStatistik.002] Kartu "Total Sampah Terkumpul", "Total Relawan Aktif", "Total Event Selesai" tampil', async ({
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
      (url) => url.pathname === "/api/events/rekap",
      (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(MOCK_REKAP),
        }),
    );

    await page.goto("/dashboard/admin/monitoring");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("Rekap Statistik Keseluruhan")).toBeVisible({
      timeout: 8_000,
    });

    // Tiga kartu statistik harus ada
    await expect(page.getByText("Total Sampah Terkumpul")).toBeVisible();
    await expect(page.getByText("Total Relawan Aktif")).toBeVisible();
    await expect(page.getByText("Total Event Selesai")).toBeVisible();
  });

  test("[TC.RekapStatistik.003] Nilai pada kartu sesuai dengan data dari API", async ({
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
      (url) => url.pathname === "/api/events/rekap",
      (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(MOCK_REKAP),
        }),
    );

    await page.goto("/dashboard/admin/monitoring");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("Rekap Statistik Keseluruhan")).toBeVisible({
      timeout: 8_000,
    });

    // Nilai totalSampahKg — format lokal Indonesia: 1.250
    await expect(page.getByText(/1\.250\s*kg/)).toBeVisible();
    // Nilai totalRelawanAktif
    await expect(
      page.getByText(String(MOCK_REKAP.totalRelawanAktif)),
    ).toBeVisible();
    // Nilai totalEventSelesai
    await expect(
      page.getByText(String(MOCK_REKAP.totalEventSelesai)),
    ).toBeVisible();
  });

  test("[TC.RekapStatistik.004] Relawan (non-admin) di-redirect ke /dashboard", async ({
    page,
    request,
  }) => {
    const { token, user } = await loginViaAPI(
      request,
      RELAWAN_EMAIL,
      RELAWAN_PASSWORD,
    );
    await page.goto("/");
    await setAuthInBrowser(page, token, user);

    await Promise.all([
      page.waitForURL((url) => url.pathname === "/dashboard", {
        timeout: 10_000,
      }),
      page.goto("/dashboard/admin/monitoring"),
    ]);

    expect(page.url()).toContain("/dashboard");
    expect(page.url()).not.toContain("/monitoring");
  });
});
