// playwright.config.ts
import { FullConfig, Reporter, Suite } from "@playwright/test/reporter";
import ZebAgent from "./src/lib/ZebAgent";
import ResultsParser from "./src/lib/ResultsParser";

class MyReporter implements Reporter {
  private config!: FullConfig;
  private suite!: Suite;

  onBegin(config: FullConfig, suite: Suite) {
    this.config = config;
    this.suite = suite;
  }

  async onEnd() {
    let resultsParser = new ResultsParser(this.suite)
    await resultsParser.parse();
    let r = await resultsParser.getParsedResults();
    console.log(r)
    // await postResultsToZebrunner(results)
  }

  async postResultsToZebrunner(data) {
    let zebAgent = new ZebAgent(this.config);
    const startTime = new Date().getTime() - 10000;
    await zebAgent.initialize();
    let r = await zebAgent.startTestRun({
      name: 'meh',
      startedAt: new Date(startTime + 1000).toISOString(),
      framework: 'Playwright',
      config: {
        environment: 'PROD',
      },
    });
    const testRunId = r.data.id;
  
    let testExecResponse = await zebAgent.startTestExecution(testRunId, {
      name: 'my test',
      className: 'my class',
      methodName: 'meh',
      startedAt: new Date(startTime + 2000).toISOString(),
    });
    let testId = testExecResponse.data.id;
  
    await zebAgent.finishTestExecution(testRunId, testId, {
      result: 'FAILED',
      reason: 'test falied bla',
      endedAt: new Date(startTime + 3000).toISOString(),
    });
  
    await zebAgent.finishTestRun(testRunId, {
      endedAt: new Date(startTime + 4000).toISOString(),
    });
  }
}
export default MyReporter;
