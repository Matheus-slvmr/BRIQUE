import { defineConfig, devices } from "@playwright/test";

const executablePath = process.env.PLAYWRIGHT_EXECUTABLE_PATH;

export default defineConfig({
  testDir: "./tests/e2e",
  use: { baseURL: "http://127.0.0.1:3000", trace: "on-first-retry" },
  projects: [{ name: "mobile-chromium", use: { ...devices["Pixel 7"], launchOptions: executablePath ? { executablePath } : undefined } }],
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1",
    url: "http://127.0.0.1:3000/",
    reuseExistingServer: true,
    timeout: 120_000,
    env: { BRIQUEGO_DB_FILE: "e2e.db" },
  },
});
