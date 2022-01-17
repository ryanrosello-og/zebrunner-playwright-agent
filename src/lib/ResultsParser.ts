import { testRailLabels, xrayLabels, zephyrLabels } from './constants';
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
  xrayConfig: xrayConfig;
  testRailConfig: testRailConfig;
  zephyrConfig: zephyrConfig;
};

export type xrayConfig = {
  testKey: {
    key: string;
    value: string[];
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

export type testRailConfig = {
  suiteId: {
    key: string;
    value: string;
  };
  caseId: {
    key: string;
    value: string[];
  };
  runId: {
    key: string;
    value: string;
  };
  runName: {
    key: string;
    value: string;
  };
  milestone: {
    key: string;
    value: string;
  };
  assignee: {
    key: string;
    value: string;
  };
  enableSync: {
    key: string;
    value: boolean;
  };
  includeAllTestCasesInNewRun: {
    key: string;
    value: boolean;
  };
  enableRealTimeSync: {
    key: string;
    value: boolean;
  };
} & {};

export type zephyrConfig = {
  testCycleKey: {
    key: string;
    value: string;
  };
  jiraProjectKey: {
    key: string;
    value: string;
  };
  testCaseKey: {
    key: string;
    value: string[];
  };
  enableSync: {
    key: string;
    value: boolean;
  };
  enableRealTimeSync: {
    key: string;
    value: boolean;
  };
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
      const {maintainer, xrayConfig, testRailConfig, zephyrConfig} = this.annotationsParser(test.annotations);
      for (const result of test.results) {
        testResults.push({
          suiteName: suiteName,
          name: `${suiteName} > ${test.title}`,
          tags: this.getTestTags(test.title, xrayConfig, testRailConfig, zephyrConfig),
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
          testRailConfig,
          zephyrConfig,
        });
      }
    }
    return testResults;
  }

  annotationsParser(annotations: {type: string, description: string}[]) {
    const maintainer = annotations.filter(el => el.type === 'maintainer');
    const xrayConfig = this.parseXrayConfig(annotations);
    const testRailConfig = this.parseTestRailConfig(annotations);
    const zephyrConfig = this.parseZephyrConfig(annotations);
    return {maintainer, xrayConfig, testRailConfig, zephyrConfig};
  }

  parseTestRailConfig(annotations: {type: string, description: string}[]): testRailConfig {
    const readyTestRailConfig = {
      suiteId: {
        key: testRailLabels.SUITE_ID,
        value: '',
      },
      caseId: {
        key: testRailLabels.CASE_ID,
        value: [],
      },
      runId: {
        key: testRailLabels.RUN_ID,
        value: '',
      },
      runName: {
        key: testRailLabels.RUN_NAME,
        value: '',
      },
      milestone: {
        key: testRailLabels.MILESTONE,
        value: '',
      },
      assignee: {
        key: testRailLabels.ASSIGNEE,
        value: '',
      },
      enableSync: {
        key: testRailLabels.SYNC_ENABLED,
        value: true,
      },
      includeAllTestCasesInNewRun: {
        key: testRailLabels.INCLUDE_ALL,
        value: false,
      },
      enableRealTimeSync: {
        key: testRailLabels.SYNC_REAL_TIME,
        value: false,
      },
    }

    annotations.forEach((testrail) => {
      if (testrail.type === 'testRailSuiteId') {
        readyTestRailConfig.suiteId.value = testrail.description;
      }
      if (testrail.type === 'testRailCaseId') {
        readyTestRailConfig.caseId.value.push(testrail.description);
      }
      if (testrail.type === 'testRailRunId') {
        readyTestRailConfig.runId.value = testrail.description;
      }
      if(testrail.type === 'testRailRunName') {
        readyTestRailConfig.runName.value = testrail.description;
      }
      if(testrail.type === 'testRailMilestone') {
        readyTestRailConfig.milestone.value = testrail.description;
      }
      if(testrail.type === 'testRailAssignee') {
        readyTestRailConfig.assignee.value = testrail.description;
      }
      if(testrail.type === 'testRailDisableSync') {
        readyTestRailConfig.enableSync.value = !JSON.parse(testrail.description);
      }
      if (testrail.type === 'testRailIncludeAll') {
        readyTestRailConfig.includeAllTestCasesInNewRun.value = JSON.parse(testrail.description);
      }
      if (testrail.type === 'testRailEnableRealTimeSync') {
        readyTestRailConfig.enableRealTimeSync.value = JSON.parse(testrail.description);
        readyTestRailConfig.includeAllTestCasesInNewRun.value = JSON.parse(testrail.description);
      }
    })

    if (!this.isValidConfig(readyTestRailConfig, 'suiteId', 'caseId')) {
      return {};
    }

    return readyTestRailConfig;
  }

  parseXrayConfig(annotations: {type: string, description: string}[]): xrayConfig {
    const readyXrayConfig = {
      executionKey: {
        key: xrayLabels.EXECUTION_KEY,
        value: '',
      },
      testKey: {
        key: xrayLabels.TEST_KEY,
        value: [],
      },
      disableSync: {
        key: xrayLabels.SYNC_ENABLED,
        value: true,
      },
      enableRealTimeSync: {
        key: xrayLabels.SYNC_REAL_TIME,
        value: false,
      }
    }

    annotations.forEach((xray) => {
      if (xray.type === 'xrayExecutionKey') {
        readyXrayConfig.executionKey.value = xray.description;
      }
      if (xray.type === 'xrayTestKey') {
        readyXrayConfig.testKey.value.push(xray.description);
      }
      if (xray.type === 'xrayDisableSync') {
        readyXrayConfig.disableSync.value = !JSON.parse(xray.description);
      } 
      if (xray.type === 'xrayEnableRealTimeSync') {
        readyXrayConfig.enableRealTimeSync.value = JSON.parse(xray.description);
      }
    });
    
    if (!this.isValidConfig(readyXrayConfig, 'executionKey', 'testKey')) {
      return {};
    }

    return readyXrayConfig;
  }

  parseZephyrConfig(annotations: {type: string, description: string}[]): zephyrConfig {
    const readyZephyrConfig = {
      testCycleKey: {
        key: zephyrLabels.TEST_CYCLE_KEY,
        value: '',
      },
      jiraProjectKey: {
        key: zephyrLabels.JIRA_PROJECT_KEY,
        value: '',
      },
      testCaseKey: {
        key: zephyrLabels.TEST_CASE_KEY,
        value: [],
      },
      enableSync: {
        key: zephyrLabels.SYNC_ENABLED,
        value: true,
      },
      enableRealTimeSync: {
        key: zephyrLabels.SYNC_REAL_TIME,
        value: false,
      },
    }

    annotations.forEach((zephyr) => {
      if (zephyr.type === 'zephyrTestCycleKey') {
        readyZephyrConfig.testCycleKey.value = zephyr.description;
      }
      if (zephyr.type === 'zephyrJiraProjectKey') {
        readyZephyrConfig.jiraProjectKey.value = zephyr.description;
      }
      if (zephyr.type === 'zephyrTestCaseKey') {
        readyZephyrConfig.testCaseKey.value.push(zephyr.description);
      }
      if (zephyr.type === 'zephyrDisableSync') {
        readyZephyrConfig.enableSync.value = !JSON.parse(zephyr.description);
      }
      if (zephyr.type === 'zephyrEnableRealTimeSync') {
        readyZephyrConfig.enableRealTimeSync.value = JSON.parse(zephyr.description);
      }
    })

    if (!this.isValidConfig(readyZephyrConfig, 'testCycleKey', 'testCaseKey') || !this.isValidConfig(readyZephyrConfig, 'jiraProjectKey', 'testCaseKey')) {
      return {};
    }

    return readyZephyrConfig;
  }

  isValidConfig(config, option, testOption) {
    console.log(config);
    return config[option].value && config[testOption].value.length !== 0 ? true : false;
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

  getTestTags(testTitle, xrayConfig, testRailConfig, zephyrConfig) {
    let tags = testTitle.match(/@\w*/g) || [];
    if (Object.keys(xrayConfig).length !== 0) {
      xrayConfig.testKey.value.forEach((el) => {
        if (el) {
          tags.push({
            key: xrayConfig.testKey.key,
            value: el,
          });
        }
      })
    }

    if (Object.keys(testRailConfig).length !== 0) {
      testRailConfig.caseId.value.forEach((el) => {
        if (el) {
          tags.push({
            key: testRailConfig.caseId.key,
            value: el,
          });
        }
      })
    }

    if (Object.keys(zephyrConfig).length !== 0) {
      zephyrConfig.testCaseKey.value.forEach((el) => {
        if (el) {
          tags.push({
            key: zephyrConfig.testCaseKey.key,
            value: el,
          });
        }
      })
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
