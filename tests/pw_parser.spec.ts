import {test, expect} from '@playwright/test';
import ResultsParser from '../src/lib/ResultsParser';

test('parser', async ({page}) => {
  let testData = {
    title: '',
    parent: undefined,
    suites: [
      {
        title: 'webkit',
        tests: [],
        suites: [
          {
            title: 'tests/pw_nested_testsuite.spec.js',
            tests: [],
            suites: [
              {
                title: 'nested foo',
                tests: [],
                suites: [
                  {
                    title: 'foo - L2',
                    suites: [],
                    parent: {
                      title: 'nested foo',
                    },
                    tests: [
                      {
                        title: 'basic test @broke',
                        retries: 0,
                        results: [
                          {
                            attachments: [
                              {
                                name: 'trace',
                                contentType: 'application/zip',
                                path: '/Users/it/repo/pw-zeb/test-results/tests-pw_nested_testsuite-nested-foo-foo-l2-basic-test-broke-webkit/trace.zip',
                              },
                              {
                                name: 'screenshot',
                                contentType: 'image/png',
                                path: '/Users/it/repo/pw-zeb/test-results/tests-pw_nested_testsuite-nested-foo-foo-l2-basic-test-broke-webkit/test-failed-1.png',
                              },
                            ],
                            error: {
                              message:
                                '\u001b[2mexpect(\u001b[22m\u001b[31mreceived\u001b[39m\u001b[2m).\u001b[22mtoHaveText\u001b[2m(\u001b[22m\u001b[32mexpected\u001b[39m\u001b[2m)\u001b[22m\n\nExpected string: \u001b[32m"Playwright\u001b[7m_broke\u001b[27m"\u001b[39m\nReceived string: \u001b[31m"Playwright"\u001b[39m\n\nCall log:\n  - \u001b[2mwaiting for selector ".navbar__inner .navbar__title"\u001b[22m\n\u001b[2m  -   selector resolved to <b class="navbar__title">Playwright</b>\u001b[22m\n\u001b[2m  -   unexpected value "Playwright"\u001b[22m\n\u001b[2m  -   selector resolved to <b class="navbar__title">Playwright</b>\u001b[22m\n\u001b[2m  -   unexpected value "Playwright"\u001b[22m\n\u001b[2m  -   selector resolved to <b class="navbar__title">Playwright</b>\u001b[22m\n\u001b[2m  -   unexpected value "Playwright"\u001b[22m\n\u001b[2m  -   selector resolved to <b class="navbar__title">Playwright</b>\u001b[22m\n\u001b[2m  -   unexpected value "Playwright"\u001b[22m\n\u001b[2m  -   selector resolved to <b class="navbar__title">Playwright</b>\u001b[22m\n\u001b[2m  -   unexpected value "Playwright"\u001b[22m\n\u001b[2m  -   selector resolved to <b class="navbar__title">Playwright</b>\u001b[22m\n\u001b[2m  -   unexpected value "Playwright"\u001b[22m\n\u001b[2m  -   selector resolved to <b class="navbar__title">Playwright</b>\u001b[22m\n\u001b[2m  -   unexpected value "Playwright"\u001b[22m\n\u001b[2m  -   selector resolved to <b class="navbar__title">Playwright</b>\u001b[22m\n\u001b[2m  -   unexpected value "Playwright"\u001b[22m\n',
                              stack:
                                'Error: \u001b[2mexpect(\u001b[22m\u001b[31mreceived\u001b[39m\u001b[2m).\u001b[22mtoHaveText\u001b[2m(\u001b[22m\u001b[32mexpected\u001b[39m\u001b[2m)\u001b[22m\n\nExpected string: \u001b[32m"Playwright\u001b[7m_broke\u001b[27m"\u001b[39m\nReceived string: \u001b[31m"Playwright"\u001b[39m\n\nCall log:\n  - \u001b[2mwaiting for selector ".navbar__inner .navbar__title"\u001b[22m\n\u001b[2m  -   selector resolved to <b class="navbar__title">Playwright</b>\u001b[22m\n\u001b[2m  -   unexpected value "Playwright"\u001b[22m\n\u001b[2m  -   selector resolved to <b class="navbar__title">Playwright</b>\u001b[22m\n\u001b[2m  -   unexpected value "Playwright"\u001b[22m\n\u001b[2m  -   selector resolved to <b class="navbar__title">Playwright</b>\u001b[22m\n\u001b[2m  -   unexpected value "Playwright"\u001b[22m\n\u001b[2m  -   selector resolved to <b class="navbar__title">Playwright</b>\u001b[22m\n\u001b[2m  -   unexpected value "Playwright"\u001b[22m\n\u001b[2m  -   selector resolved to <b class="navbar__title">Playwright</b>\u001b[22m\n\u001b[2m  -   unexpected value "Playwright"\u001b[22m\n\u001b[2m  -   selector resolved to <b class="navbar__title">Playwright</b>\u001b[22m\n\u001b[2m  -   unexpected value "Playwright"\u001b[22m\n\u001b[2m  -   selector resolved to <b class="navbar__title">Playwright</b>\u001b[22m\n\u001b[2m  -   unexpected value "Playwright"\u001b[22m\n\u001b[2m  -   selector resolved to <b class="navbar__title">Playwright</b>\u001b[22m\n\u001b[2m  -   unexpected value "Playwright"\u001b[22m\n\n    at /Users/it/repo/pw-zeb/tests/pw_nested_testsuite.spec.ts:24:27\n    at FixtureRunner.resolveParametersAndRunHookOrTest (/Users/it/repo/pw-zeb/node_modules/@playwright/test/lib/fixtures.js:306:12)\n    at WorkerRunner._runTestWithBeforeHooks (/Users/it/repo/pw-zeb/node_modules/@playwright/test/lib/workerRunner.js:499:7)',
                            },
                            startTime:
                              'Sat Dec 18 2021 19:43:16 GMT+1000 (Australian Eastern Standard Time)',
                            duration: 7630,
                            steps: [
                              {
                                title: 'Before Hooks',
                                startTime:
                                  'Sat Dec 18 2021 19:43:16 GMT+1000 (Australian Eastern Standard Time)',
                              },
                              {
                                title: 'expect.toHaveText',
                                startTime:
                                  'Sat Dec 18 2021 19:43:18 GMT+1000 (Australian Eastern Standard Time)',
                                error: {
                                  message:
                                    '\u001b[2mexpect(\u001b[22m\u001b[31mreceived\u001b[39m\u001b[2m).\u001b[22mtoHaveText\u001b[2m(\u001b[22m\u001b[32mexpected\u001b[39m\u001b[2m)\u001b[22m\n\nExpected string: \u001b[32m"Playwright\u001b[7m_broke\u001b[27m"\u001b[39m\nReceived string: \u001b[31m"Playwright"\u001b[39m\n\nCall log:\n  - \u001b[2mwaiting for selector ".navbar__inner .navbar__title"\u001b[22m\n\u001b[2m  -   selector resolved to <b class="navbar__title">Playwright</b>\u001b[22m\n\u001b[2m  -   unexpected value "Playwright"\u001b[22m\n\u001b[2m  -   selector resolved to <b class="navbar__title">Playwright</b>\u001b[22m\n\u001b[2m  -   unexpected value "Playwright"\u001b[22m\n\u001b[2m  -   selector resolved to <b class="navbar__title">Playwright</b>\u001b[22m\n\u001b[2m  -   unexpected value "Playwright"\u001b[22m\n\u001b[2m  -   selector resolved to <b class="navbar__title">Playwright</b>\u001b[22m\n\u001b[2m  -   unexpected value "Playwright"\u001b[22m\n\u001b[2m  -   selector resolved to <b class="navbar__title">Playwright</b>\u001b[22m\n\u001b[2m  -   unexpected value "Playwright"\u001b[22m\n\u001b[2m  -   selector resolved to <b class="navbar__title">Playwright</b>\u001b[22m\n\u001b[2m  -   unexpected value "Playwright"\u001b[22m\n\u001b[2m  -   selector resolved to <b class="navbar__title">Playwright</b>\u001b[22m\n\u001b[2m  -   unexpected value "Playwright"\u001b[22m\n\u001b[2m  -   selector resolved to <b class="navbar__title">Playwright</b>\u001b[22m\n\u001b[2m  -   unexpected value "Playwright"\u001b[22m\n',
                                  stack:
                                    '\u001b[2mexpect(\u001b[22m\u001b[31mreceived\u001b[39m\u001b[2m).\u001b[22mtoHaveText\u001b[2m(\u001b[22m\u001b[32mexpected\u001b[39m\u001b[2m)\u001b[22m\n\nExpected string: \u001b[32m"Playwright\u001b[7m_broke\u001b[27m"\u001b[39m\nReceived string: \u001b[31m"Playwright"\u001b[39m\n\nCall log:\n  - \u001b[2mwaiting for selector ".navbar__inner .navbar__title"\u001b[22m\n\u001b[2m  -   selector resolved to <b class="navbar__title">Playwright</b>\u001b[22m\n\u001b[2m  -   unexpected value "Playwright"\u001b[22m\n\u001b[2m  -   selector resolved to <b class="navbar__title">Playwright</b>\u001b[22m\n\u001b[2m  -   unexpected value "Playwright"\u001b[22m\n\u001b[2m  -   selector resolved to <b class="navbar__title">Playwright</b>\u001b[22m\n\u001b[2m  -   unexpected value "Playwright"\u001b[22m\n\u001b[2m  -   selector resolved to <b class="navbar__title">Playwright</b>\u001b[22m\n\u001b[2m  -   unexpected value "Playwright"\u001b[22m\n\u001b[2m  -   selector resolved to <b class="navbar__title">Playwright</b>\u001b[22m\n\u001b[2m  -   unexpected value "Playwright"\u001b[22m\n\u001b[2m  -   selector resolved to <b class="navbar__title">Playwright</b>\u001b[22m\n\u001b[2m  -   unexpected value "Playwright"\u001b[22m\n\u001b[2m  -   selector resolved to <b class="navbar__title">Playwright</b>\u001b[22m\n\u001b[2m  -   unexpected value "Playwright"\u001b[22m\n\u001b[2m  -   selector resolved to <b class="navbar__title">Playwright</b>\u001b[22m\n\u001b[2m  -   unexpected value "Playwright"\u001b[22m\n\n    at /Users/it/repo/pw-zeb/tests/pw_nested_testsuite.spec.ts:24:27\n    at FixtureRunner.resolveParametersAndRunHookOrTest (/Users/it/repo/pw-zeb/node_modules/@playwright/test/lib/fixtures.js:306:12)\n    at WorkerRunner._runTestWithBeforeHooks (/Users/it/repo/pw-zeb/node_modules/@playwright/test/lib/workerRunner.js:499:7)',
                                },
                              },
                            ],
                            retry: 0,
                            status: 'failed',
                          },
                        ],
                      },
                    ],
                  },
                ],
                parent: {
                  title: 'tests/pw_nested_testsuite.spec.js',
                },
              },
            ],
            parent: {
              title: 'webkit',
            },
          },
        ],
      },
    ],
    tests: [],
  };

  let resultsParser = new ResultsParser(testData);
  await resultsParser.parse();
  let r = await resultsParser.getParsedResults();
  expect(
    '[{"testSuite":{"title":"nested foo > foo - L2","tests":[{"suiteName":"foo - L2","name":"basic test @broke","tags":[{"key":"tag","value":"broke"}],"status":"FAILED","retry":0,"startedAt":"2021-12-18T09:43:16.000Z","endedAt":"2021-12-18T09:43:23.630Z","reason":"expect(received).toHaveText(expected)\\n\\nExpected string: \\"Playwright_broke\\"\\nReceived string: \\"Playwright\\"\\n\\nCall log:\\n  - waiting for selector \\".navbar__inner .navbar__title\\"\\n  -   selector resolved to <b class=\\"navbar__title\\"…-   unexpected value \\"Playwright\\"\\n  -   selector resolved to <b class=\\"navbar__title\\">Playwright</b>\\n  -   unexpected value \\"Playwright\\"\\n\\n    at /Users/it/repo/pw-zeb/tests/pw_nested_testsuite.spec.ts:24:27\\n    at FixtureRunner.resolveParametersAndRunHookOrTest (/Users/it/repo/pw-zeb/node_modules/@playwright/test/lib/fixtures.js:306:12)\\n    at WorkerRunner._runTestWithBeforeHooks (/Users/it/repo/pw-zeb/node_modules/@playwright/test/lib/workerRunner.js:499:7)","level":"ERROR"}]}]}}]'
  ).toEqual(JSON.stringify(r));
  console.log(r);
});
