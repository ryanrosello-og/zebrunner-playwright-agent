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

Optionally, you can define an additional Environment variable '

ZEB_API_KEY=[your zebrunner api key] BUILD_INFO=559340345,smoke_tests npx playwright test

You can further customize the reporter by overriding these values:

* concurrentTasks - [defaults to 10] - instructs the reporter on how many concurrent requests will be made to Zebrunner in order to speed up the posting of the results
* 

# Contribution

# License