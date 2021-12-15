import {AxiosResponse} from 'axios';
import Logger from '../lib/Logger';
import Api from './Api';
import Urls from './Urls';
import {readFileSync} from 'fs';
import {randomUUID} from 'crypto';

export default class ZebAgent {
  private _refreshToken: string;
  private _header: any;
  private _urls: Urls;
  private _accessToken: string;
  private _projectKey: string;
  private _reportBaseUrl: string;
  private _concurrentTasks: number;
  private _api: Api;

  constructor(config: {reporter: any[]}) {
    const zebRunnerConf = config.reporter.filter(
      (f) => f[0].includes('zeb') || f[1]?.includes('zeb')
    );
    this._accessToken = process.env.ZEB_API_KEY;
    this._projectKey = zebRunnerConf[0][1].projectKey;
    this._reportBaseUrl = zebRunnerConf[0][1].reporterBaseUrl;
    this._concurrentTasks = zebRunnerConf[0][1].concurrentTasks || 10;
    this._urls = new Urls(this._projectKey, this._reportBaseUrl);
    this._api = new Api(2, 1000);
  }

  async initialize() {
    const payload = {
      refreshToken: this._accessToken,
    };

    let r = await this._api.post({
      url: this._urls.urlRefresh(),
      payload: payload,
      expectedStatusCode: 200,
    });

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

  async startTestRun(payload: {
    uuid?: string;
    name: string;
    startedAt: string;
    status?: 'IN_PROGRESS' | 'QUEUED';
    framework: string;
    config?: any;
    milestone?: any;
  }): Promise<AxiosResponse> {
    let r = await this._api.post({
      url: this._urls.urlRegisterRun(),
      payload: payload,
      expectedStatusCode: 200,
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
    let r = await this._api.post({
      url: this._urls.urlStartTest(testRunId),
      payload: payload,
      expectedStatusCode: 200,
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
  ): Promise<AxiosResponse<any, any> | Error> {
    let r = await this._api.put({
      url: this._urls.urlFinishTest(testRunId, testId),
      payload: payload,
      expectedStatusCode: 200,
      config: this._header,
    });
    return r;
  }

  async finishTestRun(
    testRunId: number,
    payload: {
      endedAt: string;
    }
  ): Promise<AxiosResponse<any, any> | Error> {
    let r = await this._api.put({
      url: this._urls.urlFinishRun(testRunId),
      payload: payload,
      expectedStatusCode: 200,
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
    let r = await this._api.post({
      url: this._urls.urlScreenshots(testRunId, testId),
      payload: Buffer.from(file),
      expectedStatusCode: 201,
      config: {
        headers: {
          Authorization: this._refreshToken,
          'Content-Type': 'image/png',
        },
      },
    });
    return r;
  }

  async addTestTags(
    testRunId: number,
    testId: number,
    items: any[]
  ): Promise<AxiosResponse<any, any> | Error> {
    if (!items) return;

    let payload = {
      items,
    };

    let r = await this._api.put({
      url: this._urls.urlTestExecutionLabel(testRunId, testId),
      payload: payload,
      expectedStatusCode: 204,
      config: this._header,
    });
    return r;
  }

  async addTestRunTags(testRunId: number, items: any[]): Promise<AxiosResponse<any, any> | Error> {
    if (!items) return;

    let payload = {
      items,
    };
    let r = await this._api.put(
      {
        url: this._urls.urlTestRunLabel(testRunId),
        payload: payload,
        expectedStatusCode: 204,
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
    let r = await this._api.post({
      url: this._urls.urlStartSession(options.testRunId),
      payload: payload,
      expectedStatusCode: 200,
      config: this._header,
    });
    return r;
  }

  async finishTestSession(
    sessionId: string,
    testRunId: number,
    endedAt: string,
    testIds: number[]
  ): Promise<AxiosResponse<any, any> | Error> {
    let payload = {
      endedAt: endedAt,
      testIds: testIds,
    };
    let r = await this._api.put({
      url: this._urls.urlFinishSession(testRunId, sessionId),
      payload: payload,
      expectedStatusCode: 200,
      config: this._header,
    });
    return r;
  }
}
