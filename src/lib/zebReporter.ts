// playwright.config.ts
import {FullConfig, Reporter, Suite} from '@playwright/test/reporter';
import ZebAgent from './ZebAgent';
import ResultsParser, {testResult, testSuite} from './ResultsParser';
import {PromisePool} from '@supercharge/promise-pool';

type testRun = {title: string; tests: testResult[]; testRunId: number};
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
    let resultsParser = new ResultsParser(this.suite);
    await resultsParser.parse();
    let r = await resultsParser.getParsedResults();
    console.log(r);
    await this.postResultsToZebRunner(r);
  }

  async postResultsToZebRunner(testResults: testSuite[]) {
    console.time('Duration');
    await this.zebAgent.initialize();
    let runStartTime = new Date(testResults[0].testSuite.tests[0].startedAt).getTime() - 1000;
    let testRuns = await this.startTestRuns(runStartTime, testResults);
    console.log('testRuns >>', testRuns);

    let testRunTags = await this.addTestRunTags(testRuns);
    let allTests = testRuns.map((t) => t.tests).flat(1);

    let testsExecutions = await this.startTestExecutions(allTests);
    let testTags = await this.addTestTags(testsExecutions.results);
    let screenshots = await this.addScreenshots(testsExecutions.results);
    let z = await this.finishTestExecutions(testsExecutions.results);
    await this.sendTestSessions(runStartTime, testsExecutions.results);
    let stopTestRunsResult = await this.stopTestRuns(testRuns, new Date().toISOString());

    console.timeEnd('Duration');
  }

  async startTestRuns(runStartTime: number, testResults: testSuite[]): Promise<testRun[]> {
    const {results, errors} = await PromisePool.withConcurrency(this.zebAgent.concurrency)
      .for(testResults)
      .process(async (testResult, index, pool) => {
        let r = await this.zebAgent.startTestRun({
          name: testResult.testSuite.title,
          startedAt: new Date(runStartTime).toISOString(),
          framework: 'Playwright',
          config: {
            environment: process.env.TEST_ENVIRONMENT ? process.env.TEST_ENVIRONMENT : '-',
            build: process.env.BUILD_INFO ? process.env.BUILD_INFO : new Date().toISOString(),
          },
        });
        let testRunId = r.data.id;
        testResult.testSuite.tests.forEach((t) => (t['testRunId'] = testRunId));
        return {testRunId, ...testResult.testSuite};
      });

    return results;
  }

  async stopTestRuns(testRuns: testRun[], runEndTime: string) {
    const {results, errors} = await PromisePool.withConcurrency(this.zebAgent.concurrency)
      .for(testRuns)
      .process(async (testRun: testRun, index, pool) => {
        await this.zebAgent.finishTestRun(testRun.testRunId, {
          endedAt: runEndTime,
        });
      });

    return {results, errors};
  }

  async addTestRunTags(testRuns: testRun[]) {
    const {results, errors} = await PromisePool.withConcurrency(this.zebAgent.concurrency)
      .for(testRuns)
      .process(async (testRun: testRun, index, pool) => {
        await this.zebAgent.addTestRunTags(testRun.testRunId, [
          {
            key: 'group',
            value: 'Regression',
          },
        ]);
      });

    return {results, errors};
  }

  async addTestTags(tests) {
    const {results, errors} = await PromisePool.withConcurrency(this.zebAgent.concurrency)
      .for(tests)
      .process(async (test: testResult, index, pool) => {
        let r = await this.zebAgent.addTestTags(test.testRunId, test.testId, test.tags);
        return {r};
      });

    return {results, errors};
  }

  async addScreenshots(tests) {
    const {results, errors} = await PromisePool.withConcurrency(this.zebAgent.concurrency)
      .for(tests)
      .process(async (test: testResult, index, pool) => {
        let r = await this.zebAgent.attachScreenshot(test.testRunId, test.testId, test.attachment);
        return {r};
      });

    return {results, errors};
  }

  async startTestExecutions(tests) {
    const {results, errors} = await PromisePool.withConcurrency(this.zebAgent.concurrency)
      .for(tests)
      .process(async (test: testResult, index, pool) => {
        let testExecResponse = await this.zebAgent.startTestExecution(test.testRunId, {
          name: test.name,
          className: 'TODO',
          methodName: 'TODO',
          startedAt: test.startedAt,
        });
        let testId = testExecResponse.data.id;
        return {testId, ...test};
      });
    return {results, errors};
  }

  async finishTestExecutions(tests: testResult[]) {
    const {results, errors} = await PromisePool.withConcurrency(this.zebAgent.concurrency)
      .for(tests)
      .process(async (test: testResult, index, pool) => {
        let r = await this.zebAgent.finishTestExecution(test.testRunId, test.testId, {
          result: test.status,
          reason: test.reason,
          endedAt: test.endedAt,
        });

        return r;
      });
    return {results, errors};
  }

  async sendTestSessions(runStartTime: number, testResults) {
    const groupBy = (array, key) => {
      return array.reduce((result, currentValue) => {
        (result[currentValue[key]] = result[currentValue[key]] || []).push(currentValue);
        return result;
      }, {});
    };

    const testSuitesGrouped = groupBy(testResults, 'testRunId');
    const {results, errors} = await PromisePool.withConcurrency(this.zebAgent.concurrency)
      .for(Object.entries(testSuitesGrouped))
      .process(async (suite: [string, testResult[]], index, pool) => {
        let sess = await this.zebAgent.startTestSession({
          browser: 'chrome', // TODO: - need to figure out how to determine the browser type testIds[0].browser,
          startedAt: new Date(runStartTime).toISOString(),
          testRunId: Number(suite[0]),
          testIds: suite[1].map((t) => t.testId),
        });

        let r = await this.zebAgent.finishTestSession(
          sess.data.id,
          Number(suite[0]),
          new Date(runStartTime + 1).toISOString(),
          suite[1].map((t) => t.testId)
        );

        return {r};
      });
    return {results, errors};
  }
}
export default ZebRunnerReporter;
