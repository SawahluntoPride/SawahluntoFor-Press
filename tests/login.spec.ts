import { test, expect } from "@playwright/test";

// Jalankan `curl http://localhost:3000/api/seed` (atau buka URL itu di browser)
// dulu sebelum test ini, supaya akun-akun di bawah tersedia di database dev.

test.describe("Login", () => {
  test("media user berhasil login dan masuk ke dashboard", async ({ page }) => {
    await page.goto("/masuk");
    await page.getByRole("textbox", { name: /email/i }).fill("wartawan@kompas.com");
    await page.getByRole("textbox", { name: /kata sandi/i }).fill("Media123!");
    await page.getByRole("button", { name: /masuk/i }).click();

    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("admin berhasil login dan masuk ke area admin", async ({ page }) => {
    await page.goto("/admin/masuk");
    await page.getByRole("textbox", { name: /email/i }).fill("admin@sawahlunto.go.id");
    await page.getByRole("textbox", { name: /kata sandi/i }).fill("Admin123!");
    await page.getByRole("button", { name: /masuk/i }).click();

    await expect(page).toHaveURL(/\/admin/);
  });

  test("login gagal dengan password salah menampilkan pesan error", async ({ page }) => {
    await page.goto("/masuk");
    await page.getByRole("textbox", { name: /email/i }).fill("wartawan@kompas.com");
    await page.getByRole("textbox", { name: /kata sandi/i }).fill("password-salah");
    await page.getByRole("button", { name: /masuk/i }).click();

    await expect(page.getByText(/email atau kata sandi salah/i)).toBeVisible();
  });

  test("media user tidak bisa akses /admin, dilempar ke /dashboard", async ({ page }) => {
    await page.goto("/masuk");
    await page.getByRole("textbox", { name: /email/i }).fill("wartawan@kompas.com");
    await page.getByRole("textbox", { name: /kata sandi/i }).fill("Media123!");
    await page.getByRole("button", { name: /masuk/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    await page.goto("/admin");
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("belum login, akses /dashboard dilempar ke halaman masuk", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/masuk/);
  });
});