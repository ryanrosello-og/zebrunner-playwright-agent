// playwright.config.ts
import {FullConfig, Reporter, Suite} from '@playwright/test/reporter';
import ZebAgent from './src/lib/ZebAgent';
import ResultsParser, {testResult} from './src/lib/ResultsParser';
import {PromisePool} from '@supercharge/promise-pool';

class MyReporter implements Reporter {
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

  async postResultsToZebRunner(testResults) {
    console.time('Duration');
    await this.zebAgent.initialize();

    let testRuns = await this.startTestRuns(testResults);
    console.log('testRuns >>', testRuns);

    let testRunTags = await this.addTestRunTags(testRuns);
    let allTests = testRuns.map((t) => t.tests).flat(1);

    let testsExecutions = await this.startTestExecutions(allTests);
    let testTags = await this.addTestTags(testsExecutions.results);
    let screenshots = await this.addScreenshots(testsExecutions.results);
    let z = await this.finishTestExecutions(testsExecutions.results);

    let stopTestRunsResult = await this.stopTestRuns(testRuns, new Date().toISOString());

    console.timeEnd('Duration');
  }

  async startTestRuns(testResults) {
    let runStartTime = new Date(testResults[0].testSuite.tests[0].startedAt).getTime() - 1000;

    const {results, errors} = await PromisePool.withConcurrency(10)
      .for(testResults)
      .process(async (testResult, index, pool) => {
        let r = await this.zebAgent.startTestRun({
          name: testResult.testSuite.title,
          startedAt: new Date(runStartTime).toISOString(),
          framework: 'Playwright',
          config: {
            environment: 'PROD',
            build: process.env.BUILD_INFO ? process.env.BUILD_INFO : new Date().toISOString(),
          },
        });
        let testRunId = r.data.id;
        // testResult.testSuite.tests.map(t => ({...t, testRunId}))
        testResult.testSuite.tests.forEach((t) => (t['testRunId'] = testRunId));
        return {testRunId, ...testResult.testSuite};
      });

    return results;
  }

  async stopTestRuns(testRuns, runEndTime) {
    const {results, errors} = await PromisePool.withConcurrency(10)
      .for(testRuns)
      .process(async (testRun, index, pool) => {
        await this.zebAgent.finishTestRun(testRun.testRunId, {
          endedAt: runEndTime,
        });
      });

    return {results, errors};
  }

  async addTestRunTags(testRuns) {
    const {results, errors} = await PromisePool.withConcurrency(10)
      .for(testRuns)
      .process(async (testRun, index, pool) => {
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
    const {results, errors} = await PromisePool.withConcurrency(10)
      .for(tests)
      .process(async (test, index, pool) => {
        let r = await this.zebAgent.addTestTags(test.testRunId, test.testId, test.tags);
        return {r};
      });

    return {results, errors};
  }

  async addScreenshots(tests) {
    const {results, errors} = await PromisePool.withConcurrency(10)
      .for(tests)
      .process(async (test, index, pool) => {
        let r = await this.zebAgent.attachScreenshot(test.testRunId, test.testId, test.attachment);
        return {r};
      });

    return {results, errors};
  }

  async startTestExecutions(tests) {
    const {results, errors} = await PromisePool.withConcurrency(10)
      .for(tests)
      .process(async (test, index, pool) => {
        let testExecResponse = await this.zebAgent.startTestExecution(test.testRunId, {
          name: test.name,
          className: 'TODO',
          methodName: 'TODO',
          startedAt: test.startedAt,
        });
        let testId = testExecResponse.data.id;
        return {testId, ...(test as {})};
      });
    return {results, errors};
  }

  async finishTestExecutions(tests: testResult[]) {
    const {results, errors} = await PromisePool.withConcurrency(10)
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

  async startTestSessions(fn, tests) {
    const {results, errors} = await PromisePool.withConcurrency(10)
      .for(tests)
      .process(async (test, index, pool) => {
        let sess = await fn({
          browser: 'chrome', // TODO: - need to figure out how to determine the browser type testIds[0].browser,
          startedAt: new Date(runStartTime).toISOString(),
          testRunId: testRunId,
          testIds: testIds.map((t) => t.testId),
        });
      });
    return {results, errors};
  }

  async zzpostResultsToZebRunner(testResults) {
    console.time('Duration');
    let zebAgent = new ZebAgent(this.config);
    await zebAgent.initialize();
    let runStartTime = new Date(testResults[0].testSuite.tests[0].startedAt).getTime() - 1000;
    for (const testResult of testResults) {
      let r = await zebAgent.startTestRun({
        name: testResult.testSuite.title,
        startedAt: new Date(runStartTime).toISOString(),
        framework: 'Playwright',
        config: {
          environment: 'PROD',
          build: new Date().toISOString(),
        },
      });
      let testRunId = r.data.id;
      await zebAgent.addTestRunTags(testRunId, [
        {
          key: 'group',
          value: 'Regression',
        },
      ]);

      let runEndTime = '';
      let testsWithAttachments = [];
      let testIds = [];
      const {results, errors} = await PromisePool.withConcurrency(10)
        .for(testResult.testSuite.tests)
        .process(async (test, index, pool) => {
          let testExecResponse = await zebAgent.startTestExecution(testRunId, {
            name: test.name,
            className: 'TODO',
            methodName: 'TODO',
            startedAt: test.startedAt,
          });
          let testId = testExecResponse.data.id;
          testIds.push({testId, browser: test.browser});

          await zebAgent.addTestTags(testRunId, testId, test.tags);

          await zebAgent.finishTestExecution(testRunId, testId, {
            result: test.status,
            reason: test.reason,
            endedAt: test.endedAt,
          });

          if (test.attachment !== null) {
            testsWithAttachments.push({testId, attachment: test.attachment});
          }
          runEndTime = test.endedAt; // end time will be last assignment
        });

      // upload tests that have attachments
      for (const testsWithAttachment of testsWithAttachments) {
        await zebAgent.attachScreenshot(
          testRunId,
          testsWithAttachment.testId,
          testsWithAttachment.attachment
        );
      }

      // set the browser type
      let sess = await zebAgent.startTestSession({
        browser: 'chrome', // TODO: - need to figure out how to determine the browser type testIds[0].browser,
        startedAt: new Date(runStartTime).toISOString(),
        testRunId: testRunId,
        testIds: testIds.map((t) => t.testId),
      });

      await zebAgent.finishTestSession(
        sess.data.id,
        testRunId,
        new Date(runStartTime + 1).toISOString(),
        testIds.map((t) => t.testId)
      );

      await zebAgent.finishTestRun(testRunId, {
        endedAt: runEndTime,
      });
    }
    console.timeEnd('Duration');
  }
}
export default MyReporter;
