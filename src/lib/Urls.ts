export default class Urls {
  private _projectKey: string;
  private _baseUrl: string;

  constructor(projectKey: string, baseUrl: string) {
    this._projectKey = projectKey;
    this._baseUrl = baseUrl;
  }

  urlRefresh() {
    return `${this._baseUrl}/api/iam/v1/auth/refresh`;
  }

  urlRegisterRun() {
    return `${this._baseUrl}/api/reporting/v1/test-runs?projectKey=${this._projectKey}`;
  }

  urlFinishRun(testRunId: string) {
    return `${this._baseUrl}/api/reporting/v1/test-runs/${testRunId}`;
  }

  urlStartTest(testRunId: string) {
    return `${this._baseUrl}/api/reporting/v1/test-runs/${testRunId}/tests`;
  }

  urlFinishTest(testRunId: string, testId: string) {
    return `${this._baseUrl}/api/reporting/v1/test-runs/${testRunId}/tests/${testId}`;
  }

  urlSendLogs(testRunId: string) {
    return `${this._baseUrl}/api/reporting/v1/test-runs/${testRunId}/logs`;
  }
  
  urlSendScreenShot(testRunId: string, testId: string) {
    return `${this._baseUrl}/api/reporting/v1/test-runs/${testRunId}/tests/${testId}/screenshots`;
  }
}
