const xrayLabels = {
  SYNC_ENABLED: 'com.zebrunner.app/tcm.xray.sync.enabled',
  SYNC_REAL_TIME: 'com.zebrunner.app/tcm.xray.sync.real-time',
  EXECUTION_KEY: 'com.zebrunner.app/tcm.xray.test-execution-key',
  TEST_KEY: 'com.zebrunner.app/tcm.xray.test-key',
}

export default class zebTCM {
  private tests;

  constructor(tests) {
    this.tests = tests;
  }

  parse() {
    const res = this.tests.map((el) => {
      if (!!el.xrayConfig.testKey) {
        el.tags.push({
          key: xrayLabels.TEST_KEY,
          value: el.xrayConfig.testKey,
        });
      }
      if (el.xrayConfig) {
        return {
          ...el, 
          xrayConfig: {
            executionKey: {
              key: xrayLabels.EXECUTION_KEY,
              value: el.xrayConfig.executionKey,
            },
            enableSync: {
              key: xrayLabels.SYNC_ENABLED,
              value: el.xrayConfig.syncEnabled
            },
            enableRealTimeSync: {
              key: xrayLabels.SYNC_REAL_TIME,
              value: el.xrayConfig.enableRealTimeSync
            },
          }
        }
      }
      return el;
    })
    return res;
  }
}