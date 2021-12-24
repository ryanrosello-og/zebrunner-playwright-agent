# pw-zeb ![Biulds](https://github.com/ryanrosello-og/zebrunner-playwright-agent/actions/workflows/main.yml/badge.svg) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/ryanrosello-og/zebrunner-playwright-agent/blob/master/LICENSE)

> Publish [Playwright](https://playwright.dev/) test results directly to [Zebrunner](https://zebrunner.com/) after the completion of all test suite execution.

# Setup

Run the following:

`yarn add zebrunner-playwright-agent -D`

Modify your playwright config by enabling the reporter.  You will need to update the `reporterBaseUrl` and `projectKey` keys to match your account.

```
  reporter: [
    [
      './node_modules/zebrunner-playwright-agent/src/build/src/lib/zebReporter.js',
      {
        reporterBaseUrl: 'https://default.zebrunner.com',
        projectKey: 'DEF',
        enabled: true,
        concurrentTasks: 10,
      },
    ],
  ],
```

Run your tests by providing your Zebrunner API_KEY as an environment variable:

`ZEB_API_KEY=[your zebrunner api key] npx playwright test`

# Configuration

It is highly recommended that you enable the screenshot on failure feature in your `playwright.config.ts` config file:

```
  use: {
    ...
    screenshot: 'only-on-failure',
    ...
  },
```

This will allow the agent to include screenshots of failures in the reports.

Optionally, you can define an additional Environment variable in the CLI

* BUILD_INFO - test suites will be tagged with the provided comma separated values 
* TEST_ENVIRONMENT - which environment the tests ran against e.g. STG or PROD

The example below will classify the `smoke_tests` as having run in the `dev` environment against the CI build number `559340345`

`ZEB_API_KEY=[your zebrunner api key] BUILD_INFO=559340345,smoke_tests TEST_ENVIRONMENT=dev npx playwright test`

You can further customize the reporter by overriding these values:

| Config          | Default | Description                                                                                                                                                                                 |   |
|-----------------|---------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---|
| enabled         | true    | When this key is set to false, the agent will not post results to Zebrunner.                                                                                                                |   |
| concurrentTasks | 10      | Instructs the reporter on how many concurrent requests will be made to Zebrunner in order to speed up the posting of the results.  The maximum allowable number of parallel requests is 20. |   |
| reporterBaseUrl |         | The base url for your Zebrunner instance                                                                                                                                                    |   |
| projectKey      |         | The Zebrunner project key.  e.g. DEF                                                                                                                                                        |   |

# Contribution

# License
