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

  constructor(config: {reporter: any[]}) {
    const zebRunnerConf = config.reporter.filter(
      (f) => f[0].includes('zeb') || f[1]?.includes('zeb')
    );
    this._accessToken = process.env.ZEB_API_KEY;
    this._projectKey = zebRunnerConf[0][1].projectKey;
    this._reportBaseUrl = zebRunnerConf[0][1].reporterBaseUrl;
    this._concurrentTasks = zebRunnerConf[0][1].concurrentTasks || 10;
    this._urls = new Urls(this._projectKey, this._reportBaseUrl);
  }

  async initialize(): Promise<void> {
    const payload = {
      refreshToken: this._accessToken,
    };
    let r = await Api.post(this._urls.urlRefresh(), payload);
    if (r.status !== 200) {
      throw new Error(`Failed to obtain an auth token, request was ${this._urls.urlRefresh()} with payload: ${payload} \n 
      Ensure you have provided a value Auth token via ENV variable "ZEB_API_KEY"`);
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

  async startTestRun(payload: {
    uuid?: string;
    name: string;
    startedAt: string;
    status?: 'IN_PROGRESS' | 'QUEUED';
    framework: string;
    config?: any;
    milestone?: any;
  }): Promise<AxiosResponse> {
    let r = await Api.post(this._urls.urlRegisterRun(), payload, this._header);
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
    let r = await Api.post(this._urls.urlStartTest(testRunId), payload, this._header);
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
    let r = await Api.put(this._urls.urlFinishTest(testRunId, testId), payload, this._header);
    return r;
  }

  async finishTestRun(
    testRunId: number,
    payload: {
      endedAt: string;
    }
  ): Promise<AxiosResponse> {
    let r = await Api.put(this._urls.urlFinishRun(testRunId), payload, this._header);
    return r;
  }

  async attachScreenshot(
    testRunId?: number,
    testId?: number,
    imagePath?: string
  ): Promise<AxiosResponse> {
    if (!imagePath) return;

    const file = readFileSync(imagePath);
    let r = await Api.post(this._urls.urlScreenshots(testRunId, testId), Buffer.from(file), {
      headers: {
        Authorization: this._refreshToken,
        'Content-Type': 'image/png',
      },
    });
    return r;
  }

  async addTestTags(testRunId: number, testId: number, items: any[]): Promise<AxiosResponse> {
    if (!items) return;

    let payload = {
      items,
    };
    let r = await Api.put(
      this._urls.urlTestExecutionLabel(testRunId, testId),
      payload,
      this._header
    );
    return r;
  }

  async addTestRunTags(testRunId: number, items: any[]): Promise<AxiosResponse> {
    if (!items) return;

    let payload = {
      items,
    };
    let r = await Api.put(this._urls.urlTestRunLabel(testRunId), payload, this._header);
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

    let r = await Api.post(this._urls.urlStartSession(options.testRunId), payload, this._header);
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

    let r = await Api.put(this._urls.urlFinishSession(testRunId, sessionId), payload, this._header);
    return r;
  }
}
