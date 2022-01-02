// playwright.config.ts
import {PlaywrightTestConfig, devices} from '@playwright/test';

const config: PlaywrightTestConfig = {
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  use: {
    trace: 'on',
    screenshot: 'only-on-failure',
  },
  projects: [
    // {
    //   name: 'chromium',
    //   use: {...devices['Desktop Chrome']},
    // },
    // {
    //   name: 'firefox',
    //   use: {...devices['Desktop Firefox']},
    // },
    {
      name: 'webkit',
      use: {...devices['Desktop Safari']},
    },
  ],
  reporter: [
    [
      './src/lib/zebReporter.js',
      {
        reporterBaseUrl: 'https://default.zebrunner.com',
        projectKey: 'DEF',
        enabled: true,
        concurrentTasks: 19,
        postToSlack: true,
        slackReportingChannels: 'zeb,general',
      },
    ],
  ],
};
export default config;
