import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => { await page.goto("/"); await page.evaluate(() => localStorage.clear()); });

const observe = async (page: import("@playwright/test").Page, title: string, changed: string, next: string) => {
  await page.locator(".record-form input").first().fill(title);
  await page.locator(".record-form textarea").nth(0).fill(changed);
  await page.locator(".record-form textarea").nth(1).fill(next);
  await page.getByRole("button", { name: "Save observation" }).click();
};

test("command palette: shortcut opens, record search runs, Escape restores focus", async ({ page }) => {
  await page.goto("/");
  const dialog = page.getByRole("dialog", { name: "Command palette" });
  const trigger = page.getByRole("button", { name: /Search records/ });
  const input = page.getByPlaceholder("Search records or run a command…");

  // keyboard shortcut opens and Escape closes
  await page.locator("body").click();
  await page.keyboard.press("Control+k");
  await expect(dialog).toBeVisible();
  await input.press("Escape");
  await expect(dialog).toBeHidden();

  // trigger opens; searching a record and pressing Enter navigates to it
  await trigger.click();
  await input.fill("HO-40");
  await expect(page.getByRole("option", { name: /HO-40/ })).toBeVisible();
  await input.press("Enter");
  await expect(page).toHaveURL(/\/handoffs\/HO-40/);
  await expect(dialog).toBeHidden();

  // focus returns to the trigger when dismissed with Escape. Open via keyboard
  // activation so the restore target is deterministic — WebKit blurs a button on
  // mouse click, which would leave nothing to restore to.
  await trigger.focus();
  await trigger.press("Enter");
  await expect(dialog).toBeVisible();
  await input.press("Escape");
  await expect(trigger).toBeFocused();
});

test("undo and redo time-travel a real record mutation", async ({ page }) => {
  await page.goto("/issues/new");
  const count = () => page.evaluate(() => JSON.parse(localStorage["carryover.workspace.v2"]).issues.length as number);
  const before = await count();
  await observe(
    page,
    "Undo check drift on Labeler 02",
    "Vision sensor reads late by about forty milliseconds during ramp-up, causing intermittent mislabels on the first cases.",
    "Recalibrate before the ten o'clock run and verify twenty consecutive cases.",
  );
  await expect(page).toHaveURL(/\/issues\/CO-/);
  await expect.poll(count).toBe(before + 1);

  await page.getByRole("button", { name: "Undo" }).click();
  await expect.poll(count).toBe(before);

  await page.getByRole("button", { name: "Redo" }).click();
  await expect.poll(count).toBe(before + 1);
});

test("a change in one tab live-syncs to another tab", async ({ page, context }) => {
  await page.goto("/issues");
  const other = await context.newPage();
  await other.goto("/issues");

  await page.goto("/issues/new");
  const title = "Cross-tab sync verification on Filler 03";
  await observe(
    page,
    title,
    "Filler pressure trend drifts slowly upward across the shift and needs monitoring before the next production run.",
    "Next shift should watch the pressure trend and log readings hourly through the window.",
  );
  await expect(page).toHaveURL(/\/issues\/CO-/);

  // the other tab, still on the issue register, adopts the persisted change
  await expect(other.getByText(title)).toBeVisible();
  await other.close();
});
