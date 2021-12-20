// playwright.config.ts
import {FullConfig, Reporter, Suite} from '@playwright/test/reporter';
import ZebAgent from './ZebAgent';
import ResultsParser, {testResult, testRun, testSuite} from './ResultsParser';
import {PromisePool} from '@supercharge/promise-pool';

class ZebRunnerReporter implements Reporter {
  private config!: FullConfig;
  private suite!: Suite;
  private zebAgent: ZebAgent;

  onBegin(config: FullConfig, suite: Suite) {
    this.config = config;
    this.suite = suite;
    this.zebAgent = new ZebAgent(this.config);
  }

  async onEnd() {
    if (!this.zebAgent.isEnabled) {
      console.log('Zebrunner agent disabled - skipped results upload');
      return;
    }
    await this.zebAgent.initialize();

    let resultsParser = new ResultsParser(this.suite);
    await resultsParser.parse();
    let r = await resultsParser.getParsedResults();
    console.log(r);
    await this.postResultsToZebRunner(r);
  }

  async postResultsToZebRunner(testResults: testRun) {
    console.time('Duration');
    let runStartTime = new Date(testResults.tests[0].startedAt).getTime() - 1000;
    let testRunName = `${
      process.env.BUILD_INFO ? process.env.BUILD_INFO : new Date().toISOString()
    } ${process.env.TEST_ENVIRONMENT ? process.env.TEST_ENVIRONMENT : '-'}`;
    let testRunId = await this.startTestRuns(runStartTime, testRunName);
    console.log('testRuns >>', testRunId);

    let testRunTags = await this.addTestRunTags(testRunId, [
      {
        key: 'group',
        value: 'Regression',
      },
    ]); // broke - labels does not appear in the UI

    let testsExecutions = await this.startTestExecutions(testRunId, testResults.tests);
    let testTags = await this.addTestTags(testRunId, testsExecutions.results);
    let screenshots = await this.addScreenshots(testRunId, testsExecutions.results);
    await this.sendTestSteps(testRunId, testsExecutions.results);

    let z = await this.finishTestExecutions(testRunId, testsExecutions.results);
    await this.sendTestSessions(testRunId, runStartTime, testsExecutions.results);

    let stopTestRunsResult = await this.stopTestRuns(testRunId, new Date().toISOString());

    console.timeEnd('Duration');
    let summary = [
      //['Tests uploaded', z.results.map(t => t.status).length],
      //['Screenshots uploaded', screenshots.results.filter((t) => t.status === 201).length],
      ['Tests uploaded', 'TODO'],
      ['Screenshots uploaded', 'TODO'],
    ];
    console.table(summary);
  }

  async startTestRuns(runStartTime: number, testRunName: string): Promise<number> {
    let r = await this.zebAgent.startTestRun({
      name: testRunName,
      startedAt: new Date(runStartTime).toISOString(),
      framework: 'Playwright',
      config: {
        environment: process.env.TEST_ENVIRONMENT ? process.env.TEST_ENVIRONMENT : '-',
        build: process.env.BUILD_INFO ? process.env.BUILD_INFO : new Date().toISOString(),
      },
    });

    if (isNaN(r.data.id)) {
      return Promise.reject('Failed to initiate test run');
    } else {
      return Number(r.data.id);
    }
  }

  async stopTestRuns(testRunId: number, runEndTime: string) {
    let r = await this.zebAgent.finishTestRun(testRunId, {
      endedAt: runEndTime,
    });
    return r;
  }

  async addTestRunTags(testRunId: number, tags: any[]) {
    let r = await this.zebAgent.addTestRunTags(testRunId, tags);
    return r;
  }

  async addTestTags(testRunId: number, tests) {
    const {results, errors} = await PromisePool.withConcurrency(this.zebAgent.concurrency)
      .for(tests)
      .process(async (test: testResult, index, pool) => {
        let r = await this.zebAgent.addTestTags(testRunId, test.testId, test.tags);
        return {r};
      });

    return {results, errors};
  }

  async addScreenshots(testRunId: number, tests) {
    const {results, errors} = await PromisePool.withConcurrency(this.zebAgent.concurrency)
      .for(tests)
      .process(async (test: testResult, index, pool) => {
        let r = await this.zebAgent.attachScreenshot(testRunId, test.testId, test.attachment);
        return r;
      });

    return {results, errors};
  }

  async sendTestSteps(testRunId: number, testResults: testResult[]) {
    let logEntries = [];
    for (const result of testResults) {
      logEntries = logEntries.concat(
        result.steps.map((s) => ({
          testId: result.testId,
          ...s,
        }))
      );
    }
    let r = await this.zebAgent.addTestLogs(testRunId, logEntries);
    return r;
  }

  async startTestExecutions(testRunId: number, tests) {
    const {results, errors} = await PromisePool.withConcurrency(this.zebAgent.concurrency)
      .for(tests)
      .process(async (test: testResult, index, pool) => {
        let testExecResponse = await this.zebAgent.startTestExecution(testRunId, {
          name: test.name,
          className: test.suiteName,
          methodName: test.name,
          startedAt: test.startedAt,
        });
        let testId = testExecResponse.data.id;
        return {testId, ...test};
      });
    return {results, errors};
  }

  async finishTestExecutions(testRunId: number, tests: testResult[]) {
    const {results, errors} = await PromisePool.withConcurrency(this.zebAgent.concurrency)
      .for(tests)
      .process(async (test: testResult, index, pool) => {
        let r = await this.zebAgent.finishTestExecution(testRunId, test.testId, {
          result: test.status,
          reason: test.reason,
          endedAt: test.endedAt,
        });

        return r;
      });
    return {results, errors};
  }

  async sendTestSessions(testRunId: number, runStartTime: number, tests: testResult[]) {
    const testIds = tests.map((t) => t.testId);
    let sess = await this.zebAgent.startTestSession({
      browser: 'chrome', // TODO: - need to figure out how to determine the browser type testIds[0].browser,
      startedAt: new Date(runStartTime).toISOString(),
      testRunId: testRunId,
      testIds: testIds,
    });

    let r = await this.zebAgent.finishTestSession(
      sess.data.id,
      testRunId,
      new Date(runStartTime + 1).toISOString(),
      testIds
    );

    return r;
  }
}
export default ZebRunnerReporter;
