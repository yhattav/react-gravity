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

  // Helper function to get platform suffix
  const getPlatformSuffix = () => {
    if (process.platform === "linux") return "-linux";
    if (process.platform === "darwin") return "-darwin";
    if (process.platform === "win32") return "-windows";
    return "";
  };

  test("Main app layout visual test", async ({ page, browserName }) => {
    // Navigate to the app
    await page.goto("/");

    // Wait for the app to be fully loaded
    await page.waitForSelector(".app-header");

    // Pause the simulation immediately
    await page
      .locator('button.floating-button[title="Pause Simulation"]')
      .click();

    const screenshot = await page.screenshot({
      fullPage: true,
      animations: "disabled",
    });

    await expect(screenshot).toMatchSnapshot(
      `main-app-layout-${browserName}${getPlatformSuffix()}.png`
    );
  });

  for (const scenario of scenarios) {
    test(`Screenshot test for ${scenario} scenario`, async ({
      page,
      browserName,
    }) => {
      // Navigate to the app
      await page.goto("/");

      // Wait for the app to be fully loaded
      await page.waitForSelector(".app-header");

      // Pause the simulation first
      await page
        .locator('button.floating-button[title="Pause Simulation"]')
        .click();

      // Click the scenarios button using the correct class
      await page.locator('button.floating-button[title="Scenarios"]').click();

      // Wait for scenario list to appear and click the specific scenario
      await page.getByText(scenario, { exact: true }).click();

      // Short wait to ensure scenario is loaded but before any movement
      await page.waitForTimeout(500);

      // Take a screenshot
      const screenshot = await page.screenshot({
        fullPage: true,
        animations: "disabled",
      });

      // Compare with baseline
      await expect(screenshot).toMatchSnapshot(
        `scenario-${scenario
          .toLowerCase()
          .replace(/\s+/g, "-")}-${browserName}${getPlatformSuffix()}.png`
      );
    });
  }
});
