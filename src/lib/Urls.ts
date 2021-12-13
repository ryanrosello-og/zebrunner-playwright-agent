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

  urlFinishRun(testRunId: number) {
    return `${this._baseUrl}/api/reporting/v1/test-runs/${testRunId}`;
  }

  urlStartTest(testRunId: number) {
    return `${this._baseUrl}/api/reporting/v1/test-runs/${testRunId}/tests`;
  }

  urlFinishTest(testRunId: number, testId: number) {
    return `${this._baseUrl}/api/reporting/v1/test-runs/${testRunId}/tests/${testId}`;
  }

  urlStartSession(testRunId: number) {
    return `${this._baseUrl}/api/reporting/v1/test-runs/${testRunId}/test-sessions`;
  }

  urlTestRunLabel(testRunId: number) {
    return `${this._baseUrl}/api/reporting/v1/test-runs/${testRunId}/labels`;
  }

  urlFinishSession(testRunId: number, sessionId: string) {
    return `${this._baseUrl}/api/reporting/v1/test-runs/${testRunId}/test-sessions/${sessionId}`;
  }

  urlScreenshots(testRunId: number, testId: number) {
    return `${this._baseUrl}/api/reporting/v1/test-runs/${testRunId}/tests/${testId}/screenshots`;
  }

  urlTestExecutionLabel(testRunId: number, testId: number) {
    return `${this._baseUrl}/api/reporting/v1/test-runs/${testRunId}/tests/${testId}/labels`;
  }

  urlTestExecutionArtifact(testRunId: number, testId: number) {
    return `${this._baseUrl}/api/reporting/v1/test-runs/${testRunId}/tests/${testId}/artifact-references`;
  }

  urlSendLogs(testRunId: number) {
    return `${this._baseUrl}/api/reporting/v1/test-runs/${testRunId}/logs`;
  }

  urlSendScreenShot(testRunId: number, testId: number) {
    return `${this._baseUrl}/api/reporting/v1/test-runs/${testRunId}/tests/${testId}/screenshots`;
  }
}
