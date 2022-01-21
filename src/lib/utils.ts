import { testRailLabels, xrayLabels, zephyrLabels } from "./constants";

export type TcmConfig = {
  xray: {
    executionKey: {
      key: string;
      value: string;
    };
    disableSync: {
      key: string;
      value: boolean;
    };
    enableRealTimeSync: {
      key: string;
      value: boolean; 
    }
  } & {};
  testRail: {
    suiteId: {
      key: string;
      value: string;
    };
    runId?: {
      key: string;
      value: '',
    },
    runName?: {
      key: string;
      value: '',
    },
    milestone?:{
      key: string;
      value: '',
    },
    assignee?:{
      key: string;
      value: '',
    },
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
    }
  } & {};
  zephyr: {
    testCycleKey: {
      key: string;
      value: string;
    }
    jiraProjectKey: {
      key: string;
      value: string;
    };
    enableSync: { 
      key: string;
      value: boolean; 
    };
    enableRealTimeSync: {
      key: string;
      value: boolean;
    }
  } & {};
};

const sendEventToReporter = (type: string, data: any): void => {
  process.stdout.write(JSON.stringify({ type, data }));
};

const parseTcmRunOptions = (data): TcmConfig => {
  const tcmConfig = {
    xray: {
      executionKey: {
        key: xrayLabels.EXECUTION_KEY,
        value: '',
      },
      disableSync: {
        key: xrayLabels.SYNC_ENABLED,
        value: true,
      },
      enableRealTimeSync: {
        key: xrayLabels.SYNC_REAL_TIME,
        value: false,
      },
    } || {},
    testRail: {
      suiteId: {
        key: testRailLabels.SUITE_ID,
        value: '',
      },
      runId: {
        key: testRailLabels.RUN_ID,
        value: '',
      },
      runName: {
        key: testRailLabels.RUN_NAME,
        value: '',
      },
      milestone:{
        key: testRailLabels.MILESTONE,
        value: '',
      },
      assignee:{
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
    } || {},
    zephyr: {
      testCycleKey: {
        key: zephyrLabels.TEST_CYCLE_KEY,
        value: '',
      },
      jiraProjectKey: {
        key: zephyrLabels.JIRA_PROJECT_KEY,
        value: '',
      },
      enableSync: {
        key: zephyrLabels.SYNC_ENABLED,
        value: true,
      },
      enableRealTimeSync: {
        key: zephyrLabels.SYNC_REAL_TIME,
        value: false,
      },
    } || {},
  };
  data.forEach((obj) => {
    Object.keys(obj).forEach((key) => {
      if (key === 'xrayExecutionKey') {
        tcmConfig.xray.executionKey.value = obj[key];
      }
      if (key === 'xrayDisableSync') {
        tcmConfig.xray.disableSync.value = !JSON.parse(`${obj[key]}`);
      }
      if (key === 'xrayEnableRealTimeSync') {
        tcmConfig.xray.enableRealTimeSync.value = JSON.parse(`${obj[key]}`);
      }

      if (key === 'testRailSuiteId') {
        tcmConfig.testRail.suiteId.value = obj[key];
      }
      if (key === 'testRailRunId') {
        tcmConfig.testRail.runId.value = obj[key];
      }
      if(key === 'testRailRunName') {
        tcmConfig.testRail.runName.value = obj[key];
      }
      if(key === 'testRailMilestone') {
        tcmConfig.testRail.milestone.value = obj[key];
      }
      if(key === 'testRailAssignee') {
        tcmConfig.testRail.runName.value = obj[key];
      }
      if(key === 'testRailDisableSync') {
        tcmConfig.testRail.enableSync.value = !JSON.parse(`${obj[key]}`);
      }
      if (key === 'testRailIncludeAll') {
        tcmConfig.testRail.includeAllTestCasesInNewRun.value = JSON.parse(`${obj[key]}`);
      }
      if (key === 'testRailEnableRealTimeSync') {
        tcmConfig.testRail.enableRealTimeSync.value = JSON.parse(`${obj[key]}`);
        tcmConfig.testRail.includeAllTestCasesInNewRun.value = JSON.parse(`${obj[key]}`);
      }

      if (key === 'zephyrTestCycleKey') {
        tcmConfig.zephyr.testCycleKey.value = obj[key];
      }
      if (key === 'zephyrJiraProjectKey') {
        tcmConfig.zephyr.jiraProjectKey.value = obj[key];
      }
      if (key === 'zephyrDisableSync') {
        tcmConfig.zephyr.enableSync.value = !JSON.parse(`${obj[key]}`);
      }
      if (key === 'zephyrEnableRealTimeSync') {
        tcmConfig.zephyr.enableRealTimeSync.value = JSON.parse(`${obj[key]}`);
      }
    })
  })

  Object.keys(tcmConfig).forEach((item) => {
    Object.keys(tcmConfig[item]).forEach((key) => {
      if (tcmConfig[item][key].value === '') {
        delete tcmConfig[item][key];
      }
    })
  })

  if (!tcmConfig.xray?.executionKey?.value) {
    tcmConfig.xray = {};
  }
  if (!tcmConfig.testRail?.suiteId?.value) {
    tcmConfig.testRail = {};
  }
  if (!tcmConfig.zephyr?.jiraProjectKey?.value || !tcmConfig.zephyr?.testCycleKey?.value) {
    tcmConfig.zephyr = {};
  }
  return tcmConfig;
}

const parseTcmTestOptions = (data, tcmConfig) => {
  const filterTcm = data.filter((el) => {
    if (el.xrayTestKey) {
      if (tcmConfig.xray?.executionKey?.value) {
        return !!el.xrayTestKey.length;
      }
    }
    if (el.testRailCaseId) {
      if (tcmConfig.testRail?.suiteId?.value) {
        return !!el.testRailCaseId.length;
      }
    }
    if (el.zephyrTestCaseKey) {
      if (tcmConfig.zephyr?.jiraProjectKey?.value && tcmConfig.zephyr?.testCycleKey?.value) {
        return !!el.zephyrTestCaseKey.length;
      }
    }
  })
  return filterTcm.map((option) => {
    if (option.xrayTestKey) {
      return option.xrayTestKey.map((value) => {
        return {
          key: xrayLabels.TEST_KEY,
          value,
        }
      })
    }
    if (option.testRailCaseId) {
      return option.testRailCaseId.map((value) => {
        return {
          key: testRailLabels.CASE_ID,
          value,
        }
      })
    }
    if (option.zephyrTestCaseKey) {
      return option.zephyrTestCaseKey.map((value) => {
        return {
          key: zephyrLabels.TEST_CASE_KEY,
          value,
        }
      })
    }
  }).flat();
};

export {
  sendEventToReporter,
  parseTcmRunOptions,
  parseTcmTestOptions,
};