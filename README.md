# pw-zeb 


# Setup

run the following:

`yarn add zebrunner-playwright-agent`

Modify your playwright config by enabling the reporter:

```
  reporter: [
    [
      './node_modules/zebrunner-playwright-agent/src/build/src/lib/zebReporter.js',
      {
        reporterBaseUrl: 'https://default.zebrunner.com',
        projectKey: 'DEF',
      },
    ],
  ],
```

Run your tests by providing your Zebrunner API_KEY as an environment variable:

ZEB_API_KEY=[your zebrunner api key] npx playwright test

# Configuration

Optionally, you can define an additional Environment variable in the CLI

* BUILD_INFO - test suites will be tagged with the provided comma separated values 
* TEST_ENVIRONMENT - which environment the tests ran against e.g. STG or PROD

The example below will classify the `smoke_tests` as having run in the `dev` environment against the CI build number `559340345`

`ZEB_API_KEY=[your zebrunner api key] BUILD_INFO=559340345,smoke_tests TEST_ENVIRONMENT=dev npx playwright test`

You can further customize the reporter by overriding these values:

* concurrentTasks - [defaults to 10] - instructs the reporter on how many concurrent requests will be made to Zebrunner in order to speed up the posting of the results


# Contribution

# License