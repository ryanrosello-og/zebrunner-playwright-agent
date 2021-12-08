import * as fs from 'fs'
import { stringify } from 'querystring';

export default class ResultsParser {
  private _resultsPath: string
  private _resultsData: any

  constructor(path:string) {
    this._resultsPath =  path;

    const rawData = fs.readFileSync(this._resultsPath);
    this._resultsData = JSON.parse(rawData.toString());
    //console.log(this._resultsData);
  }

  async parse() {
    let result : { suite: string; testName: string }[]
    this._resultsData.suites.forEach(suite => {
      
    });
  }
}
