require('dotenv').config();
import { runPreChecks } from '../src/lib/validator';
import ZebAgent from './lib/ZebAgent';

let result = runPreChecks();
if (result.status === 'failed') {
  throw new Error(
    `Unable to start app - missing required environment variables: ${result.errorMessage}`,
  );
}

async function main() {
  let zebAgent = new ZebAgent();
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

(async () => {
  await main();
})().catch((e) => {
  // Deal with the fact the chain failed
  //console.log(e);
});
