import { defineConfig } from "@playwright/test";

const viewports = [
  ["desktop-1440", { width: 1440, height: 900 }],
  ["laptop-1024", { width: 1024, height: 768 }],
  ["tablet-768", { width: 768, height: 1024 }],
  ["mobile-390", { width: 390, height: 844 }],
  ["mobile-320", { width: 320, height: 568 }],
] as const;

export default defineConfig({
  testDir: "./e2e",
  outputDir: "test-results",
  fullyParallel: true,
  timeout: 60000,
  workers: 2,
  reporter: "line",
  use: { baseURL: "http://127.0.0.1:4192", trace: "retain-on-failure", screenshot: "only-on-failure" },
  webServer: { command: "npm.cmd run dev -- --host 127.0.0.1 --port 4192", url: "http://127.0.0.1:4192", reuseExistingServer: false },
  projects: ["chromium", "firefox", "webkit"].flatMap((browserName) => viewports.map(([label, viewport]) => ({ name: `${browserName}-${label}`, use: { browserName: browserName as "chromium" | "firefox" | "webkit", viewport } }))),
});
