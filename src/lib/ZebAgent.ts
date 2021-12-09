import { AxiosResponse } from 'axios';
import Logger from '../lib/Logger';
import Api from './Api';
import Urls from './Urls';

export default class ZebAgent {
  private _refreshToken: string;
  private _header: any;
  private _urls: Urls
  private _accessToken: string;

  constructor(config) {
    const zebRunnerConf = config.reporter.filter(f => f[0].includes('zeb')||f[1]?.includes('zeb'))
    this._accessToken = zebRunnerConf[0][1].apiKey
    this._urls = new Urls(zebRunnerConf[0][1].projectKey,zebRunnerConf[0][1].reporterBaseUrl)
  }

  async initialize(): Promise<void> {
    let r = await Api.post(this._urls.urlRefresh(), {
      refreshToken: this._accessToken,
    });
    this._refreshToken = `Bearer ${r.data.authToken}`;
    this._header = {
      headers: {
        Authorization: this._refreshToken,
      },
    };
    Logger.log(
      `initialize complete: obtained refreshToken ${this._refreshToken}`
    );
    Logger.log(`BASE_URL => ${process.env.BASE_URL}`);
    Logger.log(
      `ACCESS_TOKEN => ${this._accessToken.substring(0, 4)}*****`,
    );
    Logger.log(`PROJECT_KEY => ${process.env.PROJECT_KEY}`);
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
    testRunId: string,
    payload: {
      name: string;
      className: string;
      methodName: string;
      startedAt: string;
      maintainer?: string;
      testCase?: string;
      labels?: { key: string; value: string }[];
    },
  ): Promise<AxiosResponse> {
    let r = await Api.post(this._urls.urlStartTest(testRunId), payload, this._header);
    return r;
  }

  async finishTestExecution(
    testRunId: string,
    testId: string,
    payload: {
      result: 'PASSED' | 'FAILED' | 'ABORTED' | 'SKIPPED';
      reason?: string;
      endedAt?: string;
    },
  ): Promise<AxiosResponse> {
    let r = await Api.put(
      this._urls.urlFinishTest(testRunId, testId),
      payload,
      this._header,
    );
    return r;
  }

  async finishTestRun(
    testRunId: string,
    payload: {
      endedAt: string;
    },
  ): Promise<AxiosResponse> {
    let r = await Api.put(this._urls.urlFinishRun(testRunId), payload, this._header);
    return r;
  }

  // TODO
  // sendLogs
  // send screenshots
}
