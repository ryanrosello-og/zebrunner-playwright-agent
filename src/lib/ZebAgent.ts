import {AxiosResponse} from 'axios';
import Logger from '../lib/Logger';
import Api from './Api';
import Urls from './Urls';
import {readFileSync} from 'fs';
import {randomUUID} from 'crypto';
import {testStep} from './ResultsParser';
import {zebrunnerConfig} from './zebReporter';

export default class ZebAgent {
  private _refreshToken: string;
  private _header: any;
  private _urls: Urls;
  private _accessToken: string;
  private _projectKey: string;
  private _reportBaseUrl: string;
  private _concurrentTasks: number;
  private _enabled: boolean;
  private _api: Api;
  private readonly _defaultConcurrentTask = 10;
  private readonly _maximumConcurrentTask = 20;

  constructor(config: zebrunnerConfig) {
    this._accessToken = process.env.ZEB_API_KEY;
    this._projectKey = config.projectKey;
    this._reportBaseUrl = config.reporterBaseUrl;

    if (config.enabled) {
      this._enabled = true;
    } else {
      this._enabled = false;
    }

    this._concurrentTasks = config.concurrentTasks || this._defaultConcurrentTask;

    if (this._concurrentTasks > this._maximumConcurrentTask) {
      this._concurrentTasks = this._maximumConcurrentTask;
    }

    this._urls = new Urls(this._projectKey, this._reportBaseUrl);
    this._api = new Api(2, 1000);
  }

  async initialize() {
    const payload = {
      refreshToken: this._accessToken,
    };

    let endpoint = this._urls.urlRefresh();
    let r = await this._api.post({
      url: endpoint.url,
      payload: payload,
      expectedStatusCode: endpoint.status,
    });

    if (!r) {
      throw new Error('Failed to obtain refresh token');
    }

    this._refreshToken = `Bearer ${r.data.authToken}`;
    this._header = {
      headers: {
        Authorization: this._refreshToken,
      },
    };
    Logger.log(
      `initialize complete: obtained refreshToken ${this._refreshToken.substring(0, 10)}*****}`
    );
    Logger.log(`BASE_URL => ${this._reportBaseUrl}`);
    Logger.log(`ACCESS_TOKEN => ${this._accessToken.substring(0, 4)}*****`);
    Logger.log(`PROJECT_KEY => ${this._projectKey}`);
  }

  public get concurrency() {
    return this._concurrentTasks;
  }

  public get isEnabled() {
    return this._enabled;
  }

  public get projectKey() {
    return this._projectKey;
  }

  public get baseUrl() {
    return this._reportBaseUrl;
  }

  async startTestRun(payload: {
    uuid?: string;
    name: string;
    startedAt: string;
    status?: 'IN_PROGRESS' | 'QUEUED';
    framework: string;
    config?: any;
    milestone?: any;
  }): Promise<AxiosResponse> {
    let endpoint = this._urls.urlRegisterRun();
    let r = await this._api.post({
      url: endpoint.url,
      payload: payload,
      expectedStatusCode: endpoint.status,
      config: this._header,
    });
    return r;
  }

  async startTestExecution(
    testRunId: number,
    payload: {
      name: string;
      className: string;
      methodName: string;
      startedAt: string;
      maintainer?: string;
      testCase?: string;
      labels?: {key: string; value: string}[];
    }
  ): Promise<AxiosResponse> {
    let endpoint = this._urls.urlStartTest(testRunId);
    let r = await this._api.post({
      url: endpoint.url,
      payload: payload,
      expectedStatusCode: endpoint.status,
      config: this._header,
    });
    return r;
  }

  async finishTestExecution(
    testRunId: number,
    testId: number,
    payload: {
      result: 'PASSED' | 'FAILED' | 'ABORTED' | 'SKIPPED';
      reason?: string;
      endedAt?: string;
    }
  ): Promise<AxiosResponse> {
    let endpoint = this._urls.urlFinishTest(testRunId, testId);
    let r = await this._api.put({
      url: endpoint.url,
      payload: payload,
      expectedStatusCode: endpoint.status,
      config: this._header,
    });
    return r;
  }

  async finishTestRun(
    testRunId: number,
    payload: {
      endedAt: string;
    }
  ): Promise<AxiosResponse> {
    const endpoint = this._urls.urlFinishRun(testRunId);
    let r = await this._api.put({
      url: endpoint.url,
      payload: payload,
      expectedStatusCode: endpoint.status,
      config: this._header,
    });
    return r;
  }

  async attachScreenshot(
    testRunId?: number,
    testId?: number,
    imagePath?: string
  ): Promise<AxiosResponse> {
    if (!imagePath) return;

    const file = readFileSync(imagePath);
    const endpoint = this._urls.urlScreenshots(testRunId, testId);
    let r = await this._api.post({
      url: endpoint.url,
      payload: Buffer.from(file),
      expectedStatusCode: endpoint.status,
      config: {
        headers: {
          Authorization: this._refreshToken,
          'Content-Type': 'image/png',
        },
      },
    });
    return r;
  }

  async addTestLogs(testRunId: number, logs: testStep[]): Promise<AxiosResponse> {
    if (logs.length <= 0) return;
    const endpoint = this._urls.urlSendLogs(testRunId);
    let r = await this._api.post({
      url: endpoint.url,
      payload: logs,
      expectedStatusCode: endpoint.status,
      config: this._header,
    });
    return r;
  }

  async addTestTags(testRunId: number, testId: number, items: any[]): Promise<AxiosResponse> {
    if (!items) return;

    let payload = {
      items,
    };

    const endpoint = this._urls.urlTestExecutionLabel(testRunId, testId);
    let r = await this._api.put({
      url: endpoint.url,
      payload: payload,
      expectedStatusCode: endpoint.status,
      config: this._header,
    });
    return r;
  }

  async addTestRunTags(testRunId: number, items: any[]): Promise<AxiosResponse> {
    if (!items) return;

    let payload = {
      items,
    };
    const endpoint = this._urls.urlTestRunLabel(testRunId);
    let r = await this._api.put(
      {
        url: endpoint.url,
        payload: payload,
        expectedStatusCode: endpoint.status,
        config: this._header,
      },
      0
    );
    return r;
  }

  // this sends browser type to ZebRunner
  async startTestSession(options: {
    browser: string;
    startedAt: string;
    testRunId: number;
    testIds: number[];
  }): Promise<AxiosResponse> {
    let payload = {
      sessionId: randomUUID(),
      initiatedAt: options.startedAt,
      startedAt: options.startedAt,
      desiredCapabilities: {
        browserName: options.browser,
        platformName: process.platform, // This is an assumption - platform type is not defined in the Playwright results
      },
      capabilities: {
        browserName: options.browser,
        platformName: process.platform, // This is an assumption - platform type is not defined in the Playwright results
      },
      testIds: options.testIds,
    };
    const endpoint = this._urls.urlStartSession(options.testRunId);
    let r = await this._api.post({
      url: endpoint.url,
      payload: payload,
      expectedStatusCode: endpoint.status,
      config: this._header,
    });
    return r;
  }

  async finishTestSession(
    sessionId: string,
    testRunId: number,
    endedAt: string,
    testIds: number[]
  ): Promise<AxiosResponse> {
    let payload = {
      endedAt: endedAt,
      testIds: testIds,
    };
    const endpoint = this._urls.urlFinishSession(testRunId, sessionId);
    let r = await this._api.put({
      url: endpoint.url,
      payload: payload,
      expectedStatusCode: endpoint.status,
      config: this._header,
    });
    return r;
  }
}
