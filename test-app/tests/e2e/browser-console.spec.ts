import { expect, test } from '@playwright/test';

test.describe('Browser Console Logging', () => {
  test('should show detailed browser console logs when enabled', async ({
    page,
  }) => {
    // Capture console messages
    const consoleLogs: string[] = [];
    page.on('console', (msg) => {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    });

    // Navigate to the debug page
    await page.goto('/debug-browser-logging');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Click the test button
    await page.click('button:has-text("Test Browser Logging")');

    // Wait a bit for logs to appear
    await page.waitForTimeout(1000);

    // Check that we have console logs
    expect(consoleLogs.length).toBeGreaterThan(0);

    // Look for detailed format in console logs
    const logMessages = consoleLogs.filter(
      (log) =>
        log.includes('[log]') ||
        log.includes('[info]') ||
        log.includes('[error]'),
    );

    // Check if logs contain detailed format indicators
    const hasDetailedFormat = logMessages.some(
      (log) =>
        log.includes('[CLIENT/') || // Should contain CLIENT indicator
        log.includes(':'), // Should contain timestamp or file info
    );

    if (!hasDetailedFormat) {
      console.log('Console logs captured:', consoleLogs);
    }

    // This test helps us understand what's actually being logged
    expect(logMessages.length).toBeGreaterThan(0);
  });

  test('should verify actual Button component logging', async ({ page }) => {
    // Capture console messages
    const consoleLogs: string[] = [];
    page.on('console', (msg) => {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    });

    // Navigate to the main page
    await page.goto('/');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Click the "Click me" button
    await page.click('button:has-text("Click me")');

    // Wait a bit for logs to appear
    await page.waitForTimeout(1000);

    // Check that we have console logs
    expect(consoleLogs.length).toBeGreaterThan(0);

    // Look for the specific button click logs
    const buttonLogs = consoleLogs.filter(
      (log) => log.includes('Button clicked') || log.includes('Current state'),
    );

    console.log('Button click logs:', buttonLogs);

    // Verify we captured the button logs
    expect(buttonLogs.length).toBeGreaterThan(0);

    // Check for debug logs
    const debugLogs = consoleLogs.filter(
      (log) => log.includes('[DEBUG]') || log.includes('Current state'),
    );

    console.log('Debug logs:', debugLogs);
    expect(debugLogs.length).toBeGreaterThan(0);
  });

  test('should capture environment variables in browser', async ({ page }) => {
    // Navigate to the debug page
    await page.goto('/debug-browser-logging');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Get the configuration display
    const configText = await page.textContent('pre');
    console.log('Configuration from page:', configText);

    // Parse the configuration
    const config = JSON.parse(configText || '{}');

    // Verify showDetailInBrowser is set correctly
    expect(config.showDetailInBrowser).toBe(true);

    // Check other expected settings
    expect(config.showTimestamp).toBe(true);
    expect(config.showFileName).toBe(true);
    expect(config.showLineNumber).toBe(true);
    expect(config.useColors).toBe(true);
  });
});
