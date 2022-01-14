import {test as base, expect} from '@playwright/test';
import ResultsParser, {testRun} from '../src/lib/ResultsParser';

type ParserFixture = {
  testData: any;
  parsedResults: testRun;
};

const projectObj = {
  define: [],
  expect: undefined,
  outputDir: '/Users/it/repo/pw-zeb/test-results',
  repeatEach: 1,
  retries: 0,
  metadata: undefined,
  name: 'webkit',
  testDir: '/Users/it/repo/pw-zeb',
  snapshotDir: '/Users/it/repo/pw-zeb',
  testIgnore: [],
  testMatch: '**/?(*.)@(spec|test).@(ts|js|mjs)',
  timeout: 0,
  use: {
    video: 'on',
    trace: 'on',
    screenshot: 'only-on-failure',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Safari/605.1.15',
    screen: { width: 1792, height: 1120 },
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 2,
    isMobile: false,
    hasTouch: false,
    defaultBrowserType: 'webkit',
    headless: false
  }
};

const test = base.extend<ParserFixture>({
  testData: {
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
            project: () => projectObj,
            suites: [
              {
                title: 'nested foo',
                tests: [],
                project: () => projectObj,
                suites: [
                  {
                    title: 'foo - L2',
                    suites: [],
                    project: () => projectObj,
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
  },
  parsedResults: async ({testData}, use) => {
    let resultsParser = new ResultsParser(testData, null);
    resultsParser.parse();
    let r = await resultsParser.getParsedResults();
    await use(r);
  },
});

test('parses test tags from the results @unit_test', async ({parsedResults}) => {
  expect(parsedResults.tests[0].tags).toEqual([{key: 'tag', value: 'broke'}]);
});

test('parses test steps from the results @unit_test', async ({parsedResults}) => {
  expect(parsedResults.tests[0].steps).toEqual([
    {timestamp: 1639820596000, message: 'Before Hooks', level: 'INFO'},
    {
      timestamp: 1639820598000,
      message:
        'expect(received).toHaveText(expected)\n\nExpected string: "Playwright_broke"\nReceived string: "Playwright"\n\nCall log:\n  - waiting for selector ".navbar__inner .navbar__title"\n  -   selector resolved to <b class="navbar__title">Playwright</b>\n  -   unexpected value "Playwright"\n  -   selector resolved to <b class="navbar__title">Playwright</b>\n  -   unexpected value "Playwright"\n  -   selector resolved to <b class="navbar__title">Playwright</b>\n  -   unexpected value "Playwright"\n  -   selector resolved to <b class="navbar__title">Playwright</b>\n  -   unexpected value "Playwright"\n  -   selector resolved to <b class="navbar__title">Playwright</b>\n  -   unexpected value "Playwright"\n  -   selector resolved to <b class="navbar__title">Playwright</b>\n  -   unexpected value "Playwright"\n  -   selector resolved to <b class="navbar__title">Playwright</b>\n  -   unexpected value "Playwright"\n  -   selector resolved to <b class="navbar__title">Playwright</b>\n  -   unexpected value "Playwright"\n \n expect(received).toHaveText(expected)\n\nExpected string: "Playwright_broke"\nReceived string: "Playwright"\n\nCall log:\n  - waiting for selector ".navbar__inner .navbar__title"\n  -   selector resolved to <b class="navbar__title">Playwright</b>\n  -   unexpected value "Playwright"\n  -   selector resolved to <b class="navbar__title">Playwright</b>\n  -   unexpected value "Playwright"\n  -   selector resolved to <b class="navbar__title">Playwright</b>\n  -   unexpected value "Playwright"\n  -   selector resolved to <b class="navbar__title">Playwright</b>\n  -   unexpected value "Playwright"\n  -   selector resolved to <b class="navbar__title">Playwright</b>\n  -   unexpected value "Playwright"\n  -   selector resolved to <b class="navbar__title">Playwright</b>\n  -   unexpected value "Playwright"\n  -   selector resolved to <b class="navbar__title">Playwright</b>\n  -   unexpected value "Playwright"\n  -   selector resolved to <b class="navbar__title">Playwright</b>\n  -   unexpected value "Playwright"\n\n    at /Users/it/repo/pw-zeb/tests/pw_nested_testsuite.spec.ts:24:27\n    at FixtureRunner.resolveParametersAndRunHookOrTest (/Users/it/repo/pw-zeb/node_modules/@playwright/test/lib/fixtures.js:306:12)\n    at WorkerRunner._runTestWithBeforeHooks (/Users/it/repo/pw-zeb/node_modules/@playwright/test/lib/workerRunner.js:499:7)',
      level: 'ERROR',
    },
  ]);
});

test('parses test failure details from the results @unit_test', async ({parsedResults}) => {
  expect(parsedResults.tests[0].reason).toEqual(
    'expect(received).toHaveText(expected)\n\nExpected string: "Playwright_broke"\nReceived string: "Playwright"\n\nCall log:\n  - waiting for selector ".navbar__inner .navbar__title"\n  -   selector resolved to <b class="navbar__title">Playwright</b>\n  -   unexpected value "Playwright"\n  -   selector resolved to <b class="navbar__title">Playwright</b>\n  -   unexpected value "Playwright"\n  -   selector resolved to <b class="navbar__title">Playwright</b>\n  -   unexpected value "Playwright"\n  -   selector resolved to <b class="navbar__title">Playwright</b>\n  -   unexpected value "Playwright"\n  -   selector resolved to <b class="navbar__title">Playwright</b>\n  -   unexpected value "Playwright"\n  -   selector resolved to <b class="navbar__title">Playwright</b>\n  -   unexpected value "Playwright"\n  -   selector resolved to <b class="navbar__title">Playwright</b>\n  -   unexpected value "Playwright"\n  -   selector resolved to <b class="navbar__title">Playwright</b>\n  -   unexpected value "Playwright"\n \n Error: expect(received).toHaveText(expected)\n\nExpected string: "Playwright_broke"\nReceived string: "Playwright"\n\nCall log:\n  - waiting for selector ".navbar__inner .navbar__title"\n  -   selector resolved to <b class="navbar__title">Playwright</b>\n  -   unexpected value "Playwright"\n  -   selector resolved to <b class="navbar__title">Playwright</b>\n  -   unexpected value "Playwright"\n  -   selector resolved to <b class="navbar__title">Playwright</b>\n  -   unexpected value "Playwright"\n  -   selector resolved to <b class="navbar__title">Playwright</b>\n  -   unexpected value "Playwright"\n  -   selector resolved to <b class="navbar__title">Playwright</b>\n  -   unexpected value "Playwright"\n  -   selector resolved to <b class="navbar__title">Playwright</b>\n  -   unexpected value "Playwright"\n  -   selector resolved to <b class="navbar__title">Playwright</b>\n  -   unexpected value "Playwright"\n  -   selector resolved to <b class="navbar__title">Playwright</b>\n  -   unexpected value "Playwright"\n\n    at /Users/it/repo/pw-zeb/tests/pw_nested_testsuite.spec.ts:24:27\n    at FixtureRunner.resolveParametersAndRunHookOrTest (/Users/it/repo/pw-zeb/node_modules/@playwright/test/lib/fixtures.js:306:12)\n    at WorkerRunner._runTestWithBeforeHooks (/Users/it/repo/pw-zeb/node_modules/@playwright/test/lib/workerRunner.js:499:7)'
  );
  expect(parsedResults.tests[0].status).toEqual('FAILED');
  expect(parsedResults.tests[0].retry).toEqual(0);
});

test('parses path to the screenshot from the results @unit_test', async ({parsedResults}) => {
  expect(parsedResults.tests[0].attachment.screenshots[0].path).toEqual(
    '/Users/it/repo/pw-zeb/test-results/tests-pw_nested_testsuite-nested-foo-foo-l2-basic-test-broke-webkit/test-failed-1.png'
  );
});

test('parses test details from the results @unit_test', async ({parsedResults}) => {
  expect(parsedResults.tests.length).toEqual(1);
  expect(parsedResults.tests[0].startedAt).toEqual('2021-12-18T09:43:16.000Z');
  expect(parsedResults.tests[0].endedAt).toEqual('2021-12-18T09:43:23.630Z');
  expect(parsedResults.tests[0].name).toEqual('nested foo > foo - L2 > basic test @broke');
  expect(parsedResults.tests[0].suiteName).toEqual('nested foo > foo - L2');
  expect(parsedResults.tests[0].browserCapabilities).toStrictEqual({
    ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.4 Safari/605.1.15',
    browser: { name: 'Safari', version: '15.4', major: '15' },
    engine: { name: 'WebKit', version: '605.1.15' },
    os: { name: 'Mac OS', version: '10.15.7' },
    device: { vendor: undefined, model: undefined, type: undefined },
    cpu: { architecture: undefined }
  });
});
