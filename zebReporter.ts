// playwright.config.ts
import { Reporter } from '@playwright/test/reporter';
import ZebAgent from './src/lib/ZebAgent';

class MyReporter implements Reporter {
  private _zebAgent: ZebAgent
  onBegin(config, suite) {
    this._zebAgent = new ZebAgent(config);
    this._zebAgent.initialize();
    console.log(`Starting the run with ${suite.allTests().length} tests`);
    console.log('Suite:', suite)
  }
  
  onTestBegin(test) {
    const startTime = new Date().getTime()
    if(!this._zebAgent.runStarted()) {
      this._zebAgent.startTestRun({
        name: test.parent.title,
        startedAt: new Date(startTime ).toISOString(),
        framework: 'Playwright',
        config: {
          environment: 'PROD',
        },
      })
    }
  }
  //   this._zebAgent.startTestExecution(this._zebAgent.getTestRunId(), {
  //     name: test.title,
  //     className: 'my class',
  //     methodName: 'meh',
  //     startedAt: new Date(new Date().getTime()).toISOString(),
  //   })

  //   console.log(`Starting test ${test.title}`);
  //   console.log('Test:', test)
  // }
  
  // onTestEnd(test, result) {
  //   this._zebAgent.finishTestExecution(this._zebAgent.getTestRunId(), this._zebAgent.getTestId(), {
  //     result: result.status,
  //     reason: `${result.error?.message} ${result.error?.stack}`,
  //     endedAt: new Date(new Date().getTime()).toISOString(),
  //   });
  //   console.log(`Finished test ${test.title}: ${result.status}`);
  //   console.log('Finised Test:', test)
  //   console.log('Finised Result:', result)
  // }

  // onEnd(result) {
  //   this._zebAgent.finishTestRun(this._zebAgent.getTestId(), {
  //     endedAt: new Date(new Date().getTime()).toISOString(),
  //   });
  //   console.log(`Finished the run: ${result.status}`);
  //   console.log('Finished Run', result);
  // }
}
export default MyReporter;