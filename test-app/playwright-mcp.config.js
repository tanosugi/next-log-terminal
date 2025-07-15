/** @type {import('@playwright/mcp').PlaywrightMCPConfig} */
export default {
  // Browser configuration
  browser: {
    type: 'chromium',
    headless: true,
    viewport: {
      width: 1280,
      height: 720,
    },
  },

  // Server configuration
  server: {
    port: 3000,
    timeout: 30000,
  },

  // Interaction mode
  mode: 'snapshot', // Use accessibility snapshots for better reliability

  // Network settings
  network: {
    enabled: true,
    recordRequests: true,
  },

  // File upload settings
  fileUploads: {
    enabled: true,
  },
};
