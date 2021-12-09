
export default class ResultsParser {
  private _resultsData: any
  private _result:any[]

  constructor(results) {
    this._result = [];
    this._resultsData = results
    console.log(this._resultsData);
  }

  async getParsedResults() {
    return this._result
  }

  async parse() {
    for(const testSuite of this._resultsData.suites) {
      await this.parseTestSuite(testSuite)
    }
  }
  
  
  async parseTestSuite(suite, suiteIndex = 0) {
    if(suite.suites?.length > 0) {
      await this.parseTest(suite, suite.tests)
      await this.parseTestSuite(suite.suites[suiteIndex], suiteIndex++)
    } else {
      await this.parseTest(suite, suite.tests)
      return;
    }
  }
  async parseTest(suite, tests) {
    for(const test of tests) {
      let r = await this.parseTestResult(suite,test)
      this._result.push(r)
    }
  }

  async parseTestResult(suite, test) {
    let testResults = []
    for(const result of test.results) {
      testResults.push({
        suite: suite.title,
        name: test.title,
        status: this.determineStatus(result.status),
        retry: result.retry,
        startedAt: new Date(result.startTime).toISOString(),
        endedAt: new Date(result.startTime+result.duration).toISOString(),
        // testCase: `${result.location.file?}${result.location.line?}:${result.location.column?}`,
        reason: `${this.cleanseReason(result.error?.message)} \n ${this.cleanseReason(result.error?.stack)}`
      })
    }
    return testResults
  }

  cleanseReason(rawReason) {
    return rawReason.replace(/\u001b\[2m/g,'').replace(/\u001b\[22m/g,'').replace(/\u001b\[31m/g,'').replace(/\u001b\[39m/g,'')
  }

  determineStatus(status) {
    if(status==='failed')
      return 'FAILED'
    else if(status ==='passed')
      return 'PASSED'
    else if(status==='skipped')
      return 'SKIPPED'
    else
      return 'ABORTED'
  }


}
