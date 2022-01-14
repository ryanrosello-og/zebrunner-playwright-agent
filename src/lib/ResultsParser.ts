import { xrayLabels } from './constants';
import {zebrunnerConfig} from './zebReporter';

export type testResult = {
  suiteName: string;
  name: string;
  testId?: number;
  testRunId?: number;
  attachment?: {
    video: Record<string, string>[];
    files: Record<string, string>[];
    screenshots: Record<string, number>[];
  };
  browser: string;
  endedAt: string;
  reason: string;
  retry: number;
  startedAt: string;
  status: 'FAILED' | 'PASSED' | 'SKIPPED' | 'ABORTED';
  tags: {
    key: string;
    value: string;
  }[];
  steps?: testStep[];
  maintainer: string;
  xrayConfig: updateXrayConfig
};

export type updateXrayConfig = {
  testKey: {
    key: string;
    value: string;
  };
  executionKey: {
    key: string;
    value: string;
  };
  enableSync?: {
    key: string;
    value: boolean;
  };
  enableRealTimeSync?: {
    key: string;
    value: boolean;
  };
} & {};

type testXrayConfig = {
  executionKey?: string;
  testKey?: string;
  disableSync?: boolean;
  enableRealTimeSync?: boolean;
} & {};

export type testStep = {
  level: 'INFO' | 'ERROR';
  timestamp: string;
  message: string;
  testId?: number;
};

export type testSuite = {
  testSuite: {
    title: string;
    tests: testResult[];
    testRunId?: number;
  };
};

export type testRun = {
  tests: testResult[];
  testRunId?: number;
  title: string;
  testRunName: string;
  build: string;
  environment: string;
};

export type testSummary = {
  build: string;
  environment: string;
  passed: number;
  failed: number;
  skipped: number;
  aborted: number;
  duration: number;
  failures: {
    zebResult: string;
    test: string;
    message: string;
  }[];
};

export default class ResultsParser {
  private _resultsData: any;
  private _result: testRun;
  private _build: string;
  private _environment: string;

  constructor(results, config: zebrunnerConfig) {
    this._build = process.env.BUILD_INFO ? process.env.BUILD_INFO : new Date().toISOString();
    this._environment = process.env.TEST_ENVIRONMENT ? process.env.TEST_ENVIRONMENT : '-';
    this._result = {
      tests: [],
      testRunId: 0,
      title: '',
      testRunName: `${process.env.BUILD_INFO ? process.env.BUILD_INFO : new Date().toISOString()} ${
        process.env.TEST_ENVIRONMENT ? process.env.TEST_ENVIRONMENT : '-'
      }`,
      build: this._build,
      environment: this._environment,
    };
    this._resultsData = results;
  }

  public get build() {
    return this._build;
  }

  public get environment() {
    return this._environment;
  }

  async getParsedResults(): Promise<testRun> {
    return this._result;
  }

  getRunStartTime(): number {
    return new Date(this._result.tests[0].startedAt).getTime() - 1000;
  }

  async parse() {
    for (const project of this._resultsData.suites) {
      for (const testSuite of project.suites) {
        await this.parseTestSuite(testSuite);
      }
    }
  }

  async parseTestSuite(suite, suiteIndex = 0) {
    let testResults = [];
    if (suite.suites?.length > 0) {
      testResults = await this.parseTests(
        suite.parent.title ? `${suite.parent.title} > ${suite.title}` : suite.title,
        suite.tests
      );
      this.updateResults({
        tests: testResults,
      });
      await this.parseTestSuite(suite.suites[suiteIndex], suiteIndex++);
    } else {
      testResults = await this.parseTests(
        suite.parent.title ? `${suite.parent.title} > ${suite.title}` : suite.title,
        suite.tests
      );
      this.updateResults({
        tests: testResults,
      });
      return;
    }
  }

  async parseGroupedByTestSuite() {
    for (const project of this._resultsData.suites) {
      for (const testSuite of project.suites) {
        await this.parseByTestSuite(testSuite);
      }
    }
  }

  async parseByTestSuite(suite, suiteIndex = 0) {
    let testResults = [];
    if (suite.suites?.length > 0) {
      testResults = await this.parseTests(suite.title, suite.tests);
      this.updateResults({
        testSuite: {
          title: suite.parent.title ? `${suite.parent.title} > ${suite.title}` : suite.title,
          tests: testResults,
        },
      });
      await this.parseByTestSuite(suite.suites[suiteIndex], suiteIndex++);
    } else {
      testResults = await this.parseTests(suite.title, suite.tests);
      this.updateResults({
        testSuite: {
          title: suite.parent.title ? `${suite.parent.title} > ${suite.title}` : suite.title,
          tests: testResults,
        },
      });
      return;
    }
  }

  updateResults(data) {
    if (data.tests.length > 0) {
      this._result.tests = this._result.tests.concat(data.tests);
    }
  }

  async parseTests(suiteName, tests) {
    let testResults: testResult[] = [];
    for (const test of tests) {
      let browser = test._testType?.fixtures[0]?.fixtures?.defaultBrowserType[0];
      const {maintainer, xrayConfig} = this.annotationsParser(test.annotations);
      for (const result of test.results) {
        testResults.push({
          suiteName: suiteName,
          name: `${suiteName} > ${test.title}`,
          tags: this.getTestTags(test.title, xrayConfig),
          status: this.determineStatus(result.status),
          retry: result.retry,
          startedAt: new Date(result.startTime).toISOString(),
          endedAt: new Date(new Date(result.startTime).getTime() + result.duration).toISOString(),
          // testCase: `${result.location.file?}${result.location.line?}:${result.location.column?}`,
          reason: `${this.cleanseReason(result.error?.message)} \n ${this.cleanseReason(
            result.error?.stack
          )}`,
          attachment: this.processAttachment(result.attachments),
          browser: browser,
          steps: this.getTestSteps(result.steps),
          maintainer: maintainer.length > 0 ? maintainer[0].description : '',
          xrayConfig,
        });
      }
    }
    return testResults;
  }

  annotationsParser(annotations: {type: string, description: string & boolean}[]) {
    const maintainer = annotations.filter(el => el.type === 'maintainer');
    const xrayParse = annotations.reduce<testXrayConfig>((acc, el) => {
      if (el.type === 'xrayExecutionKey') {
        acc = {...acc,  executionKey: el.description};
      }
      if (el.type === 'xrayTestKey') {
        acc = {...acc, testKey: el.description};
      }
      if (el.type === 'xrayDisableSync') {
        acc = {...acc, disableSync: el.description};
      }
      if (el.type === 'xrayEnableRealTimeSync') {
        acc = {...acc, enableRealTimeSync: el.description};
      }
      return acc;
    }, {})
    const xrayConfig = this.updateXrayConfig(xrayParse);

    return {maintainer, xrayConfig};
  }

  updateXrayConfig(xrayConfig: testXrayConfig): updateXrayConfig {
    if (Object.keys(xrayConfig).length === 0 || !xrayConfig.executionKey) {
      // !fix type
      return {};
    }
    return {
      testKey: {
        key: xrayLabels.TEST_KEY,
        value: xrayConfig.testKey ? xrayConfig.testKey : '',
      },
      executionKey: {
        key: xrayLabels.EXECUTION_KEY,
        value: xrayConfig.executionKey ? xrayConfig.executionKey : '',
      },
      enableSync: {
        key: xrayLabels.SYNC_ENABLED,
        value: xrayConfig.disableSync ? false : true,
      },
      enableRealTimeSync: {
        key: xrayLabels.SYNC_REAL_TIME,
        value: xrayConfig.enableRealTimeSync ? xrayConfig.enableRealTimeSync : false,
      },
    }
  }

  cleanseReason(rawReason) {
    return rawReason
      ? rawReason
          .replace(/\u001b\[2m/g, '')
          .replace(/\u001b\[22m/g, '')
          .replace(/\u001b\[31m/g, '')
          .replace(/\u001b\[39m/g, '')
          .replace(/\u001b\[32m/g, '')
          .replace(/\u001b\[27m/g, '')
          .replace(/\u001b\[7m/g, '')
      : '';
  }

  getTestTags(testTitle, xrayConfig) {
    let tags = testTitle.match(/@\w*/g) || [];

    if (Object.keys(xrayConfig).length !== 0) {
      if (xrayConfig.testKey.value) {
        tags.push(xrayConfig.testKey)
      }
    }

    if (tags.length !== 0) {
      return tags.map((c) => {
        if (typeof c === 'string') {
          return {key: 'tag', value: c.replace('@', '')}
        }
        if (typeof c === 'object') {
          return c;
        }
      });
    }
    return null;
  }

  processAttachment(attachment) {
    if (attachment) {
      let attachmentObj = {
        video: [],
        files: [],
        screenshots: [],
      };
      attachment.forEach((el) => {
        if (el.contentType === 'video/webm') {
          attachmentObj.video.push({
            path: el.path,
            timestamp: Date.now(),
          });
        }
        if (el.contentType === 'application/zip') {
          attachmentObj.files.push({
            path: el.path,
            timestamp: Date.now(),
          });
        }
        if (el.contentType === 'image/png') {
          attachmentObj.screenshots.push({
            path: el.path,
            timestamp: Date.now(),
          });
        }
      });
      return attachmentObj;
    }
    return null;
  }

  determineStatus(status) {
    if (status === 'failed') return 'FAILED';
    else if (status === 'passed') return 'PASSED';
    else if (status === 'skipped') return 'SKIPPED';
    else return 'ABORTED';
  }

  getTestSteps(steps): testStep[] {
    let testSteps = [];

    for (const testStep of steps) {
      testSteps.push({
        timestamp: new Date(testStep.startTime).getTime(),
        message: testStep.error
          ? `${this.cleanseReason(testStep.error?.message)} \n ${this.cleanseReason(
              testStep.error?.stack
            )}`
          : testStep.title,
        level: testStep.error ? 'ERROR' : 'INFO',
      });
    }

    return testSteps;
  }
}
