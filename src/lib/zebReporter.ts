// playwright.config.ts
import {FullConfig, Reporter, Suite} from '@playwright/test/reporter';
import ZebAgent from './ZebAgent';
import ResultsParser, {testResult, testRun} from './ResultsParser';
import {PromisePool} from '@supercharge/promise-pool';
import SlackReporter from './SlackReporter';


export type zebrunnerConfig = {
  projectKey: string;
  reporterBaseUrl: string;
  enabled: boolean;
  concurrentTasks: number;
  slackEnabled: boolean;
  slackReportOnlyOnFailures: boolean;
  slackDisplayNumberOfFailures: number;
  slackReportingChannels: string;
  slackStacktraceLength: number;
};

class ZebRunnerReporter implements Reporter {
  private config!: FullConfig;
  private suite!: Suite;
  private zebConfig: zebrunnerConfig;
  private zebAgent: ZebAgent;
  private slackReporter: SlackReporter;
  private testRunId: number;
  private test: any;

  onBegin(config: FullConfig, suite: Suite) {
    const configKeys = config.reporter.filter((f) => f[0].includes('zeb') || f[1]?.includes('zeb'));
    this.zebConfig = {
      projectKey: configKeys[0][1].projectKey,
      reporterBaseUrl: configKeys[0][1].reporterBaseUrl,
      enabled: configKeys[0][1].enabled,
      concurrentTasks: configKeys[0][1].concurrentTasks,
      slackEnabled: configKeys[0][1].slackEnabled,
      slackReportOnlyOnFailures: configKeys[0][1].slackReportOnlyOnFailures,
      slackDisplayNumberOfFailures: configKeys[0][1].slackDisplayNumberOfFailures,
      slackReportingChannels: configKeys[0][1].slackReportingChannels,
      slackStacktraceLength: configKeys[0][1].slackStacktraceLength,
    };
    this.config = config;
    this.suite = suite;
    this.zebAgent = new ZebAgent(this.zebConfig);
  }

  async onEnd() {
    if (!this.zebAgent.isEnabled) {
      console.log('Zebrunner agent disabled - skipped results upload');
      return;
    }
    await this.zebAgent.initialize();

    let resultsParser = new ResultsParser(this.suite, this.zebConfig);
    await resultsParser.parse();
    let parsedResults = await resultsParser.getParsedResults();
    console.time('Duration');
    let zebrunnerResults = await this.postResultsToZebRunner(
      resultsParser.getRunStartTime(),
      parsedResults
    );

    const slackResults = zebrunnerResults.testsExecutions.results;
    delete zebrunnerResults.testsExecutions.results; // omit results from printing
    console.log(zebrunnerResults);
    console.log(
      zebrunnerResults.resultsLink !== ''
        ? `View in Zebrunner => ${zebrunnerResults.resultsLink}`
        : ''
    );
    console.timeEnd('Duration');

    // post to Slack (if enabled)
    this.slackReporter = new SlackReporter(this.zebConfig);
    if (this.slackReporter.isEnabled) {
      let testSummary = await this.slackReporter.getSummaryResults(
        this.testRunId,
        slackResults,
        resultsParser.build,
        resultsParser.environment
      );
      await this.slackReporter.sendMessage(testSummary, zebrunnerResults.resultsLink);
    }
  }

  async postResultsToZebRunner(runStartTime: number, testResults: testRun) {
    let testRunName = testResults.testRunName;
    await this.startTestRuns(runStartTime, testRunName);
    console.log('testRuns >>', this.testRunId);

    let testRunTags = await this.addTestRunTags(this.testRunId, [
      {
        key: 'group',
        value: 'Regression',
      },
    ]); // broke - labels does not appear in the UI
    let testsExecutions = await this.startTestExecutions(this.testRunId, testResults.tests);
    let testTags = await this.addTestTags(this.testRunId, testsExecutions.results);
    let screenshots = await this.addScreenshots(this.testRunId, testsExecutions.results);
    let testArtifacts = await this.addTestArtifacts(this.testRunId, testsExecutions.results);
    let testSteps = await this.sendTestSteps(this.testRunId, testsExecutions.results);
    let endTestExecutions = await this.finishTestExecutions(
      this.testRunId,
      testsExecutions.results
    );

    let testSessions = await this.sendTestSessions(
      this.testRunId,
      runStartTime,
      testsExecutions.results
    );

    let videoArtifacts = await this.addVideoArtifacts(
      this.testRunId,
      testSessions.sessionsWithVideoAttachments,
      testsExecutions.results
    );
    let stopTestRunsResult = await this.stopTestRuns(this.testRunId, new Date().toISOString());

    let summary = {
      testsExecutions: {
        success: testsExecutions.results.length,
        errors: testsExecutions.errors.length,
        results: testsExecutions.results,
      },
      testRunTags: {
        success: testRunTags.status === 204 ? 1 : 0,
        errors: testRunTags.status !== 204 ? 1 : 0,
      },
      testTags: {
        success: testTags.results.filter((f) => f && f.status === 204).length,
        errors: testTags.errors.length,
      },
      screenshots: {
        success: screenshots.results.filter((f) => f && f.status === 201).length,
        errors: screenshots.errors.length,
      },
      testArtifacts: {
        success: testArtifacts.results.filter((f) => f && f.status === 201).length,
        errors: testArtifacts.errors.length,
      },
      videoArtifacts: {
        success: videoArtifacts.results.filter((f) => f && f.status === 201).length,
        errors: videoArtifacts.errors.length,
      },
      testStepsRequests: {
        success: testSteps.status === 202 ? 1 : 0,
        errors: testSteps.status !== 202 ? 1 : 0,
      },
      endTestExecutions: {
        success: endTestExecutions.results.filter((f) => f && f.status === 200).length,
        errors: endTestExecutions.errors.length,
      },
      testSessions: {
        success: testSessions.results.filter((f) => f && f.status === 200).length,
        errors: testSessions.errors.length,
      },
      stopTestRunsResult: {
        success: stopTestRunsResult.status === 200 ? 1 : 0,
        errors: stopTestRunsResult.status !== 200 ? 1 : 0,
      },
      resultsLink: this.testRunId
        ? `${this.zebAgent.baseUrl}/projects/${this.zebAgent.projectKey}/test-runs/${this.testRunId}`
        : '',
    };
    return summary;
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
      this.testRunId = Number(r.data.id);
      return this.testRunId;
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
        return r;
      });

    return {results, errors};
  }

  async addScreenshots(testRunId: number, tests) {
    const {results, errors} = await PromisePool.withConcurrency(this.zebAgent.concurrency)
      .for(tests)
      .process(async (test: testResult, index, pool) => {
        let r = await this.zebAgent.attachScreenshot(
          testRunId,
          test.testId,
          test.attachment.screenshots
        );
        return r;
      });

    return {results, errors};
  }

  async addTestArtifacts(testRunId: number, tests) {
    const {results, errors} = await PromisePool.withConcurrency(this.zebAgent.concurrency)
      .for(tests)
      .process(async (test: testResult, index, pool) => {
        let r = await this.zebAgent.attachTestArtifacts(
          testRunId,
          test.testId,
          test.attachment.files
        );
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
    let sessionsWithVideoAttachments = [];
    const {results, errors} = await PromisePool.withConcurrency(this.zebAgent.concurrency)
      .for(tests)
      .process(async (test, index, pool) => {
        let sess = await this.zebAgent.startTestSession({
          browserCapabilities: test.browserCapabilities,
          startedAt: new Date(runStartTime).toISOString(),
          testRunId: testRunId,
          testIds: test.testId,
        });

        let res = await this.zebAgent.finishTestSession(
          sess.data.id,
          testRunId,
          new Date(runStartTime + 1).toISOString(),
          test.testId,
        );
        
        if (test.attachment.video.length > 0) {
          sessionsWithVideoAttachments.push({
            sessionId: sess.data.id,
            testId: test.testId
          })
        }
        return res;
      });

    return {sessionsWithVideoAttachments, results, errors};
  }

  async addVideoArtifacts(testRunId: number, sessionsWithVideoAttachments: Record<string, number>[], tests: testResult[]) {
    const {results, errors} = await PromisePool.withConcurrency(this.zebAgent.concurrency)
      .for(tests)
      .process(async (test, index, pool) => {
        let res;
        const result = sessionsWithVideoAttachments.filter(el => el.testId === test.testId);
        if (result.length > 0) {
          res = await this.zebAgent.sendVideoArtifacts(
            testRunId,
            result[0].sessionId,
            test.attachment.video
          );
        };
        
        return res;
      });

    return {results, errors};
  }

  // ? mb remove this
  _groupBy(array, key) {
    return array.reduce((result, currentValue) => {
      (result[currentValue[key]] = result[currentValue[key]] || []).push(currentValue);
      return result;
    }, {});
  }
}
export default ZebRunnerReporter;
