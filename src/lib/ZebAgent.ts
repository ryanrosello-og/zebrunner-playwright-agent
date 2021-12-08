import axios, { AxiosResponse } from "axios";
import Urls from "./Urls";
import Logger from "../lib/Logger";
import Api from "./Api";

export default class ZebAgent {
  private _refreshToken: string;
  private _accessToken: string;
  private _testRunId: string;
  private _testId: string;
  private _header: any;
  private _runStarted: boolean;
  private _urls: Urls;

  constructor(config) {
    const zebRunnerConf = config.reporter.filter(f => f[0].includes('zeb')||f[1]?.includes('zeb'))
    this._accessToken = zebRunnerConf[0][1].apiKey
    this._urls = new Urls(zebRunnerConf[0][1].projectKey,zebRunnerConf[0][1].reporterBaseUrl)
  }

  initialize() {
    axios.post(this._urls.urlRefresh(), {
      refreshToken: this._accessToken,
    }).then(r=>{
      console.log('r>>',r.status)
      this._runStarted = false;
      this._refreshToken = `Bearer ${r.data.authToken}`;
      this._header = {
        headers: {
          Authorization: this._refreshToken,
        },
      };
    })
  }

  initializez() {
    let chin =  Promise.resolve();
    chin.then(()=>{
      axios.post(this._urls.urlRefresh(), {
        refreshToken: this._accessToken,
      }).then((r) => {
        this._runStarted = false;
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
          `ACCESS_TOKEN => ${this._accessToken.substring(0, 4)}*****`
        );
        Logger.log(`PROJECT_KEY => ${process.env.PROJECT_KEY}`);
        // return Promise.resolve('done')
      }).catch(e=>{
        //console.log(e)
      });
    })
  }

  runStarted () {
    return this._runStarted;
  }

  getTestRunId () {
    return this._testRunId;
  }

  getTestId () {
    return this._testId;
  }

  startTestRun(payload: {
    uuid?: string;
    name: string;
    startedAt: string;
    status?: "IN_PROGRESS" | "QUEUED";
    framework: string;
    config?: any;
    milestone?: any;
  }): Promise<AxiosResponse> {
    return new Promise((resolve, reject) => {
      axios.post(this._urls.urlRegisterRun(), payload, this._header).then(r=>{
        this._runStarted = true;
        this._testRunId = r.data.id
        resolve(r)
      })
    })
  }

  startTestExecution(
    testRunId: string,
    payload: {
      name: string;
      className: string;
      methodName: string;
      startedAt: string;
      maintainer?: string;
      testCase?: string;
      labels?: { key: string; value: string }[];
    }
  ): Promise<AxiosResponse> {
    return new Promise((resolve, reject) => {
      axios.post(this._urls.urlStartTest(testRunId), payload, this._header).then(r=>{
        this._testId = r.data.id;
        resolve(r)
      })
    })
  }

  finishTestExecution(
    testRunId: string,
    testId: string,
    payload: {
      result: string;
      reason?: string;
      endedAt?: string;
    }
  ): Promise<AxiosResponse> {
    return new Promise((resolve, reject) => {
      payload.result = this.parseTestStatus(payload.result)
      axios.put(
        this._urls.urlFinishTest(testRunId, testId),
        payload,
        this._header
      ).then(r=>{
        resolve(r)
      })
    })
  }

  parseTestStatus(status: string) :  "PASSED" | "FAILED" | "ABORTED" | "SKIPPED" {
    if(status ==='passed') {
      return 'PASSED'
    }
    if(status ==='failed') {
      return 'FAILED'
    }
    if(status ==='skipped') {
      return 'SKIPPED'
    }
    return 'ABORTED'
  }

  finishTestRun(
    testRunId: string,
    payload: {
      endedAt: string;
    }
  ): Promise<AxiosResponse> {
    return new Promise((resolve, reject) => {
      axios.put(this._urls.urlFinishRun(testRunId), payload, this._header).then(r => {
        resolve(r)
      })
    })
  }

  // TODO
  // sendLogs
  // send screenshots
}
