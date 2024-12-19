import { test, expect } from "@playwright/test";

test.describe("Gravity Simulator Visual Tests", () => {
  const scenarios = [
    "Path Test",
    "React",
    "Orbit",
    "Negative Mass",
    "Three Stars",
    "Orbital Dance",
    "Galaxy Collision",
    "Flower Dance",
    "Binary Pulsar",
  ];

  const getSnapshotName = (name: string) => {
    return `${name}-chromium.png`;
  };

  test.beforeEach(async ({ page }) => {
    // Navigate to the app and verify critical elements
    await page.goto("/");

    // Wait for the app to be fully loaded with timeout
    await expect(page.locator(".app-header")).toBeVisible({ timeout: 5000 });

    // Verify that the Pause button exists
    const pauseButton = page.locator(
      'button.floating-button[title="Pause Simulation"]'
    );
    await expect(pauseButton).toBeVisible({ timeout: 5000 });

    // Verify that the Scenarios button exists
    const scenariosButton = page.locator(
      'button.floating-button[title="Scenarios"]'
    );
    await expect(scenariosButton).toBeVisible({ timeout: 5000 });
  });

  test("Main app layout visual test", async ({ page }) => {
    // Pause the simulation immediately
    await page
      .locator('button.floating-button[title="Pause Simulation"]')
      .click();

    // Wait for any animations to settle
    await page.waitForTimeout(500);

    const screenshot = await page.screenshot({
      fullPage: true,
      animations: "disabled",
    });

    await expect(screenshot).toMatchSnapshot(
      getSnapshotName("main-app-layout")
    );
  });

  for (const scenario of scenarios) {
    test(`Screenshot test for ${scenario} scenario`, async ({ page }) => {
      // Pause the simulation first
      await page
        .locator('button.floating-button[title="Pause Simulation"]')
        .click();

      // Click the scenarios button
      await page.locator('button.floating-button[title="Scenarios"]').click();

      // Wait for scenario list and verify the specific scenario exists
      const scenarioElement = page.getByText(scenario, { exact: true });
      await expect(scenarioElement).toBeVisible({ timeout: 5000 });
      await scenarioElement.click();

      // Wait for scenario to load and settle
      await page.waitForTimeout(500);

      // Take a screenshot
      const screenshot = await page.screenshot({
        fullPage: true,
        animations: "disabled",
      });

      // Compare with baseline
      const snapshotName = getSnapshotName(
        `scenario-${scenario.toLowerCase().replace(/\s+/g, "-")}`
      );

      await expect(screenshot).toMatchSnapshot(snapshotName);
    });
  }
});
