export default class ResultsParser {
  private _resultsData: any;
  private _result: any[];

  constructor(results) {
    this._result = [];
    this._resultsData = results;
    console.log(this._resultsData);
  }

  async getParsedResults() {
    return this._result;
  }

  async parse() {
    for (const testSuite of this._resultsData.suites[0].suites) {
      await this.parseTestSuite(testSuite);
    }
  }

  async parseTestSuite(suite, suiteIndex = 0) {
    let testResults = [];
    if (suite.suites?.length > 0) {
      testResults = await this.parseTests(suite.tests);
      this.updateResults({
        testSuite: {
          title: suite.title,
          tests: testResults,
        },
      });
      await this.parseTestSuite(suite.suites[suiteIndex], suiteIndex++);
    } else {
      testResults = await this.parseTests(suite.tests);
      this.updateResults({
        testSuite: {
          title: suite.title,
          tests: testResults,
        },
      });
      return;
    }
  }

  updateResults(data) {
    if (data.testSuite.tests.length > 0) {
      this._result.push(data);
    }
  }

  async parseTests(tests) {
    let testResults = [];

    for (const test of tests) {
      for (const result of test.results) {
        testResults.push({
          name: test.title,
          status: this.determineStatus(result.status),
          retry: result.retry,
          startedAt: new Date(result.startTime).toISOString(),
          endedAt: new Date(new Date(result.startTime).getTime() + result.duration).toISOString(),
          // testCase: `${result.location.file?}${result.location.line?}:${result.location.column?}`,
          reason: `${this.cleanseReason(result.error?.message)} \n ${this.cleanseReason(
            result.error?.stack
          )}`,
          attachment: this.processAttachment(result.attachments),
        });
      }
    }
    return testResults;
  }

  // async parseTestResult(test) {
  //   let testResults = [];
  //   for (const result of test.results) {
  //     testResults.push({
  //       name: test.title,
  //       status: this.determineStatus(result.status),
  //       retry: result.retry,
  //       startedAt: new Date(result.startTime).toISOString(),
  //       endedAt: new Date(result.startTime + result.duration).toISOString(),
  //       // testCase: `${result.location.file?}${result.location.line?}:${result.location.column?}`,
  //       reason: `${this.cleanseReason(result.error?.message)} \n ${this.cleanseReason(
  //         result.error?.stack
  //       )}`,
  //     });
  //   }
  //   return testResults;
  // }

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

  processAttachment(attachment) {
    if (attachment) {
      let screenshot = attachment.filter((a) => a.contentType === 'image/png');
      if (screenshot.length > 0) {
        // TODO: there could be more than one screenshot?
        return screenshot[0].path;
      } else {
        return null;
      }
    }
  }

  determineStatus(status) {
    if (status === 'failed') return 'FAILED';
    else if (status === 'passed') return 'PASSED';
    else if (status === 'skipped') return 'SKIPPED';
    else return 'ABORTED';
  }
}
