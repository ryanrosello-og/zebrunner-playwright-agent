// playwright.config.ts
import {FullConfig, Reporter, Suite} from '@playwright/test/reporter';
import ZebAgent from './src/lib/ZebAgent';
import ResultsParser from './src/lib/ResultsParser';

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
    let zebAgent = new ZebAgent(this.config);
    await zebAgent.initialize();
    const d  = new Date()
    for (const testResult of testResults) {
      let r = await zebAgent.startTestRun({
        name: testResult.testSuite.title,
        startedAt: testResult.testSuite.tests
          ? testResult.testSuite.tests[0].startedAt
          : new Date().toISOString(),
        framework: 'Playwright',
        config: {
          environment: 'PROD',
          build:`${d.getFullYear()}-${d.getMonth()}-${d.getDay()}T${d.getHours()}:${d.getHours()}`
        },
      });
      let testRunId = r.data.id;

      let lastRunTest = '';
      for (const test of testResult.testSuite.tests) {
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
        lastRunTest = test.endedAt;
      }

      await zebAgent.finishTestRun(testRunId, {
        endedAt: lastRunTest,
      });
    }
  }
}
export default MyReporter;
