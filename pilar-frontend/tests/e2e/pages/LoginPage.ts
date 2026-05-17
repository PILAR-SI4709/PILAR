/**
 * Page Object untuk halaman /login.
 *
 * Selectors berdasarkan README-TestPlan.md section 5:
 *   .login-input  → input email & password
 *   .login-btn    → tombol submit "Masuk"
 *   .google-btn   → tombol Google OAuth
 */
import { Page } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/login');
    await this.page.waitForLoadState('networkidle');
  }

  async fillEmail(email: string): Promise<void> {
    await this.page.locator('input[type="email"].login-input').fill(email);
  }

  async fillPassword(password: string): Promise<void> {
    await this.page.locator('input[type="password"].login-input').fill(password);
  }

  async submit(): Promise<void> {
    await this.page.locator('.login-btn').click();
  }

  /** Login lengkap via UI dan tunggu redirect keluar dari /login */
  async loginAndWaitForRedirect(email: string, password: string): Promise<void> {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submit();
    await this.page.waitForURL((url) => !url.pathname.includes('/login'), {
      timeout: 10_000,
    });
  }
}
