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
    for (const testResult of testResults) {
      let runStartTime = new Date(testResult.testSuite.tests[0].startedAt).getTime() - 1000;
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

      let runEndTime = '';
      let testsWithAttachments = [];
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

      await zebAgent.finishTestRun(testRunId, {
        endedAt: runEndTime,
      });
    }
    console.timeEnd('Duration');
  }
}
export default MyReporter;
