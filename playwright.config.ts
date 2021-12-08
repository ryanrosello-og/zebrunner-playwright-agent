// playwright.config.ts
import { PlaywrightTestConfig, devices } from "@playwright/test";

const config: PlaywrightTestConfig = {
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  use: {
    trace: "on",
  },
  reporter: [
    [
      "./zebReporter.ts",
      {
        apiKey:'J9nSSKlzAvRolNhFdeKEIcDkgvaHtZxfOSdrQkkQAAiEYznROo',
        reporterBaseUrl:'https://default.zebrunner.com',
        projectKey: 'DEF'
      },
    ],
  ],
};
export default config;
