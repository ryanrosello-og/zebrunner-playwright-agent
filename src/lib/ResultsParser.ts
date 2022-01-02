export type testResult = {
  suiteName: string;
  name: string;
  testId?: number;
  testRunId?: number;
  attachment?: string;
  browser: string;
  endedAt: string;
  reason: string;
  retry: number;
  startedAt: string;
  status: 'FAILED' | 'PASSED' | 'SKIPPED' | 'ABORTED';
  tags: {
    key: string;
    value: string;
  }[];
  steps?: testStep[];
};

export type testStep = {
  level: 'INFO' | 'ERROR';
  timestamp: string;
  message: string;
  testId?: number;
};

export type testSuite = {
  testSuite: {
    title: string;
    tests: testResult[];
    testRunId?: number;
  };
};

export type testRun = {
  tests: testResult[];
  testRunId?: number;
  title: string;
  testRunName: string;
  build: string;
  environment: string;
};

export default class ResultsParser {
  private _resultsData: any;
  private _result: testRun;

  constructor(results) {
    this._result = {
      tests: [],
      testRunId: 0,
      title: '',
      testRunName: `${process.env.BUILD_INFO ? process.env.BUILD_INFO : new Date().toISOString()} ${
        process.env.TEST_ENVIRONMENT ? process.env.TEST_ENVIRONMENT : '-'
      }`,
      build: process.env.BUILD_INFO ? process.env.BUILD_INFO : new Date().toISOString(),
      environment: process.env.TEST_ENVIRONMENT ? process.env.TEST_ENVIRONMENT : '-',
    };
    this._resultsData = results;
    console.log(this._resultsData);
  }

  async getParsedResults(): Promise<testRun> {
    return this._result;
  }

  getRunStartTime(): number {
    return new Date(this._result.tests[0].startedAt).getTime() - 1000;
  }

  getTotalRunDuration(): number {
    const earliestExecTime = Math.min(
      ...this._result.tests.map((t) => new Date(t.startedAt).getTime())
    );
    const latestExecTime = Math.min(
      ...this._result.tests.map((t) => new Date(t.startedAt).getTime())
    );
    return Math.ceil((latestExecTime - earliestExecTime) / 1000);
  }

  async getSummaryResults() {
    return {
      build: this._result.build,
      environment: this._result.environment,
      passed: this._result.tests.filter((t) => t.status === 'PASSED').length,
      failed: this._result.tests.filter((t) => t.status === 'FAILED').length,
      skipped: this._result.tests.filter((t) => t.status === 'SKIPPED').length,
      aborted: this._result.tests.filter((t) => t.status === 'ABORTED').length,
      duration: this.getTotalRunDuration(),
      failures: this._result.tests
        .filter((t) => t.status === 'FAILED')
        .map((failures) => ({
          test: failures.name,
          message:
            failures.reason.length > 100
              ? failures.reason.substring(0, 100).replace(/(\r\n|\n|\r)/gm, '') + ' ...'
              : failures.reason.replace(/(\r\n|\n|\r)/gm, ''),
        })),
    };
  }

  async parse() {
    for (const project of this._resultsData.suites) {
      for (const testSuite of project.suites) {
        await this.parseTestSuite(testSuite);
      }
    }
  }

  async parseTestSuite(suite, suiteIndex = 0) {
    let testResults = [];
    if (suite.suites?.length > 0) {
      testResults = await this.parseTests(
        suite.parent.title ? `${suite.parent.title} > ${suite.title}` : suite.title,
        suite.tests
      );
      this.updateResults({
        tests: testResults,
      });
      await this.parseTestSuite(suite.suites[suiteIndex], suiteIndex++);
    } else {
      testResults = await this.parseTests(
        suite.parent.title ? `${suite.parent.title} > ${suite.title}` : suite.title,
        suite.tests
      );
      this.updateResults({
        tests: testResults,
      });
      return;
    }
  }

  async parseGroupedByTestSuite() {
    for (const project of this._resultsData.suites) {
      for (const testSuite of project.suites) {
        await this.parseByTestSuite(testSuite);
      }
    }
  }

  async parseByTestSuite(suite, suiteIndex = 0) {
    let testResults = [];
    if (suite.suites?.length > 0) {
      testResults = await this.parseTests(suite.title, suite.tests);
      this.updateResults({
        testSuite: {
          title: suite.parent.title ? `${suite.parent.title} > ${suite.title}` : suite.title,
          tests: testResults,
        },
      });
      await this.parseByTestSuite(suite.suites[suiteIndex], suiteIndex++);
    } else {
      testResults = await this.parseTests(suite.title, suite.tests);
      this.updateResults({
        testSuite: {
          title: suite.parent.title ? `${suite.parent.title} > ${suite.title}` : suite.title,
          tests: testResults,
        },
      });
      return;
    }
  }

  updateResults(data) {
    if (data.tests.length > 0) {
      this._result.tests = this._result.tests.concat(data.tests);
    }
  }

  async parseTests(suiteName, tests) {
    let testResults: testResult[] = [];

    for (const test of tests) {
      let browser = test._testType?.fixtures[0]?.fixtures?.defaultBrowserType[0];
      for (const result of test.results) {
        testResults.push({
          suiteName: suiteName,
          name: `${suiteName} > ${test.title}`,
          tags: this.getTestTags(test.title),
          status: this.determineStatus(result.status),
          retry: result.retry,
          startedAt: new Date(result.startTime).toISOString(),
          endedAt: new Date(new Date(result.startTime).getTime() + result.duration).toISOString(),
          // testCase: `${result.location.file?}${result.location.line?}:${result.location.column?}`,
          reason: `${this.cleanseReason(result.error?.message)} \n ${this.cleanseReason(
            result.error?.stack
          )}`,
          attachment: this.processAttachment(result.attachments),
          browser: browser,
          steps: this.getTestSteps(result.steps),
        });
      }
    }
    return testResults;
  }

  cleanseReason(rawReason) {
    return rawReason
      ? rawReason
          .replace(/\u001b\[2m/g, '')
          .replace(/\u001b\[22m/g, '')
          .replace(/\u001b\[31m/g, '')
          .replace(/\u001b\[39m/g, '')
          .replace(/\u001b\[32m/g, '')
          .replace(/\u001b\[27m/g, '')
          .replace(/\u001b\[7m/g, '')
      : '';
  }

  getTestTags(testTitle) {
    let tags = testTitle.match(/@\w*/g);

    if (tags) {
      return tags.map((c) => ({key: 'tag', value: c.replace('@', '')}));
    }
    return null;
  }

  processAttachment(attachment) {
    if (attachment) {
      let screenshot = attachment.filter((a) => a.contentType === 'image/png');
      if (screenshot.length > 0) {
        // TODO: there could be more than one screenshot?
        return screenshot[0].path;
      }
    }
    return null;
  }

  determineStatus(status) {
    if (status === 'failed') return 'FAILED';
    else if (status === 'passed') return 'PASSED';
    else if (status === 'skipped') return 'SKIPPED';
    else return 'ABORTED';
  }

  getTestSteps(steps): testStep[] {
    let testSteps = [];

    for (const testStep of steps) {
      testSteps.push({
        timestamp: new Date(testStep.startTime).getTime(),
        message: testStep.error
          ? `${this.cleanseReason(testStep.error?.message)} \n ${this.cleanseReason(
              testStep.error?.stack
            )}`
          : testStep.title,
        level: testStep.error ? 'ERROR' : 'INFO',
      });
    }

    return testSteps;
  }
}
