import { expect, test } from "@playwright/test";

const routes = ["/", "/handoffs", "/handoffs/HO-40", "/issues", "/issues/new", "/issues/CO-201", "/actions", "/actions/AC-61", "/reports", "/missing"];
test.beforeEach(async ({ page }) => { await page.goto("/"); await page.evaluate(() => localStorage.clear()); });

test("important routes render without overflow or browser errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  for (const route of routes) {
    await page.goto(route);
    await expect(page.locator("h1")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1), `${route} has horizontal overflow`).toBe(false);
  }
  expect(errors).toEqual([]);
});

test("guided handoff performs real state transitions", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Run the handoff →" }).click();
  await expect(page.getByText("Step 1 of 6")).toBeVisible();
  await page.getByRole("link", { name: "Continue →" }).click();
  await page.getByRole("button", { name: "Load guided record" }).click();
  await page.getByRole("button", { name: "Publish prepared handoff" }).click();
  await page.getByLabel("Incoming verification note").fill("Equipment state, guide setting, and isolated bottles were cross-checked at the line.");
  await page.getByRole("button", { name: "Acknowledge responsibility" }).click();
  await page.getByRole("button", { name: "Assign action" }).click();
  await page.getByLabel("Expected proof").fill("Thirty consecutive bottles remain within the documented label alignment tolerance.");
  await page.getByRole("button", { name: "Create action" }).click();
  await page.getByLabel("What changed and how was it verified?").fill("Thirty consecutive bottles remained within documented alignment tolerance at normal speed.");
  await page.getByRole("button", { name: "Submit evidence" }).click();
  await page.getByLabel("Final resolution note").fill("Labeler 02 returned to normal operating speed.");
  await page.getByRole("button", { name: "Close action" }).click();
  await expect(page.getByText("CO-201 · Resolved")).toBeVisible();
  await expect(page.getByText("Handoff complete")).toBeVisible();
  await page.reload();
  await expect(page.getByText("CO-201 · Resolved")).toBeVisible();
});

test("operator permissions explain unavailable actions", async ({ page }) => {
  await page.goto("/handoffs");
  await page.getByLabel("Role preview").selectOption("Operator");
  await expect(page.getByRole("button", { name: "Publish prepared handoff" })).toBeDisabled();
  await expect(page.getByText("Shift supervisor or plant manager role required. Operators can record observations.")).toBeVisible();
});

test("navigation, reports, and print output remain operable", async ({ page }) => {
  await page.goto("/");
  if ((page.viewportSize()?.width ?? 0) <= 820) {
    const menu = page.getByRole("button", { name: "Menu" });
    await menu.click();
    await expect(page.getByRole("navigation", { name: "Workspaces" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(menu).toBeFocused();
    await expect(menu).toHaveAttribute("aria-expanded", "false");
  }
  await page.goto("/reports");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export CSV" }).click();
  await expect((await download).suggestedFilename()).toBe("carryover-shift-brief-2026-08-13.csv");
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".sidebar")).toBeHidden();
  await expect(page.getByText("CARRYOVER / SHIFT BRIEF")).toBeVisible();
});
