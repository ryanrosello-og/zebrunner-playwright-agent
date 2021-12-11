// playwright.config.ts
import {FullConfig, Reporter, Suite} from '@playwright/test/reporter';
import ZebAgent from './src/lib/ZebAgent';
import ResultsParser from './src/lib/ResultsParser';
import {PromisePool} from '@supercharge/promise-pool';

class MyReporter implements Reporter {
  private config!: FullConfig;
  private suite!: Suite;

  onBegin(config: FullConfig, suite: Suite) {
    this.config = config;
    this.suite = suite;
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
          key: "group",
          value: "Regression"
        }
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
