import Logger from './Logger';
import axios from 'axios';
import {AxiosResponse} from 'axios';

export default class Api {
  public static post(url: string, payload: any, config?: any): Promise<AxiosResponse> {
    // Logger.log(`POST ${this.shortenUrl(url)} ${JSON.stringify(payload)}`);
    Logger.log(`POST ${this.shortenUrl(url)}`);
    return new Promise((resolve, reject) => {
      axios.post(url, payload, config).then((r) => {
        Logger.log(`POST ${this.shortenUrl(url)} Status:${r.status}`);
        resolve(r);
      });
    });
  }

  public static put(url: string, payload: any, config?: any): Promise<AxiosResponse> {
    // Logger.log(`PUT  ${this.shortenUrl(url)} ${JSON.stringify(payload)}`);
    Logger.log(`PUT  ${this.shortenUrl(url)} `);
    return new Promise((resolve, reject) => {
      axios.put(url, payload, config).then((r) => {
        Logger.log(`PUT  ${this.shortenUrl(url)} Status:${r.status}`);
        resolve(r);
      });
    });
  }

  private static shortenUrl(url: string): string {
    return url.replace(process.env.BASE_URL, '');
  }
}
