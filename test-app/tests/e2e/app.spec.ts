import { expect, test } from '@playwright/test';

test.describe('next-log-terminal Demo App E2E', () => {
  test('should display the demo app correctly', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('h1')).toHaveText('next-log-terminal Demo');
    await expect(
      page.locator('h2', { hasText: 'Client Logging' }),
    ).toBeVisible();
    await expect(
      page.locator('h2', { hasText: 'Server Logging' }),
    ).toBeVisible();
    await expect(page.locator('text=Count: 0')).toBeVisible();
    await expect(page.locator('button', { hasText: 'Click me' })).toBeVisible();
  });

  test('should handle client-side logging and interactions', async ({
    page,
  }) => {
    const consoleLogs: string[] = [];
    const infoLogs: string[] = [];
    const warnLogs: string[] = [];
    const errorLogs: string[] = [];

    page.on('console', (msg) => {
      const text = msg.text();
      switch (msg.type()) {
        case 'log':
          consoleLogs.push(text);
          break;
        case 'info':
          infoLogs.push(text);
          break;
        case 'warning':
          warnLogs.push(text);
          break;
        case 'error':
          errorLogs.push(text);
          break;
      }
    });

    await page.goto('/');

    // Test click button
    const clickButton = page.locator('button', { hasText: 'Click me' });
    await clickButton.click();
    await expect(page.locator('text=Count: 1')).toBeVisible();

    // Test reset button
    const resetButton = page.locator('button', { hasText: 'Reset' });
    await resetButton.click();
    await expect(page.locator('text=Count: 0')).toBeVisible();

    // Test error button
    const errorButton = page.locator('button', { hasText: 'Test Error' });
    await errorButton.click();

    // Verify logs were generated
    expect(infoLogs.some((log) => log.includes('Button clicked'))).toBe(true);
    expect(warnLogs.some((log) => log.includes('Reset button clicked'))).toBe(
      true,
    );
    expect(errorLogs.some((log) => log.includes('Test error occurred'))).toBe(
      true,
    );
  });

  test('should display user list from server component', async ({ page }) => {
    await page.goto('/');

    // Check if user list is rendered
    await expect(page.locator('text=John Doe')).toBeVisible();
    await expect(page.locator('text=jane@example.com')).toBeVisible();
    await expect(page.locator('text=Bob Johnson')).toBeVisible();

    // Check explanation text
    await expect(
      page.locator('text=This component demonstrates server-side logging'),
    ).toBeVisible();
  });

  test('should handle API route', async ({ page }) => {
    const response = await page.request.get('/api/users');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data).toHaveProperty('users');
    expect(data).toHaveProperty('message');
    expect(data.users).toHaveLength(2);
  });

  test('should navigate to middleware demo page', async ({ page }) => {
    await page.goto('/');

    // Navigate to middleware demo (if we add a link)
    await page.goto('/middleware-demo');

    await expect(page.locator('h1')).toHaveText('Middleware Demo');
    await expect(
      page.locator('text=This page demonstrates middleware logging'),
    ).toBeVisible();

    const backButton = page.locator('a', { hasText: 'Back to Home' });
    await backButton.click();

    await expect(page.locator('h1')).toHaveText('next-log-terminal Demo');
  });

  test('should handle multiple button interactions', async ({ page }) => {
    await page.goto('/');

    const clickButton = page.locator('button', { hasText: 'Click me' });
    const resetButton = page.locator('button', { hasText: 'Reset' });

    // Click multiple times
    for (let i = 1; i <= 3; i++) {
      await clickButton.click();
      await expect(page.locator(`text=Count: ${i}`)).toBeVisible();
    }

    // Reset and verify
    await resetButton.click();
    await expect(page.locator('text=Count: 0')).toBeVisible();

    // Click again to ensure it works after reset
    await clickButton.click();
    await expect(page.locator('text=Count: 1')).toBeVisible();
  });

  test('should log "Button clicked" when Click me button is clicked', async ({
    page,
  }) => {
    // Mock API endpoint to capture requests
    await page.route('/api/log-terminal', async (route) => {
      const request = route.request();
      const postData = request.postData();

      // Store request for verification
      if (postData) {
        const requestData = JSON.parse(postData);
        // Store in test logs for verification
        await page.request.post('/api/test-logs', {
          data: {
            action: 'add',
            logData: {
              level: requestData.level,
              message: requestData.message,
              args: requestData.args,
              metadata: requestData.metadata,
            },
          },
        });
      }

      // Respond with success
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    // Start server log capture
    await page.request.post('/api/test-logs', {
      data: { action: 'start' },
    });

    await page.goto('/');

    // "Click me" ボタンをクリック
    const clickButton = page.locator('button', { hasText: 'Click me' });
    await clickButton.click();

    // カウントが更新されることを確認
    await expect(page.locator('text=Count: 1')).toBeVisible();

    // Wait for API call to complete
    await page.waitForTimeout(1000);

    // Get captured server logs
    const logsResponse = await page.request.get('/api/test-logs');
    const logsData = await logsResponse.json();

    // Stop log capture
    await page.request.post('/api/test-logs', {
      data: { action: 'stop' },
    });

    // Verify logs were captured
    expect(logsData.logs.length).toBeGreaterThan(0);

    // Find the "Button clicked" log
    const buttonClickedLog = logsData.logs.find((log: any) =>
      log.message?.includes('Button clicked'),
    );

    expect(buttonClickedLog).toBeDefined();
    expect(buttonClickedLog.level).toBe('info');
    expect(buttonClickedLog.args[0]).toHaveProperty('count', 1);
    expect(buttonClickedLog.metadata).toHaveProperty('timestamp');
  });
});
