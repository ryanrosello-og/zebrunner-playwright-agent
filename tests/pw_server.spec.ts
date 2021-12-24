import {test, expect,request} from '@playwright/test';
import ResultsParser, {testRun} from '../src/lib/ResultsParser';
import * as http from 'http';

const startServer = async () => {
  const portNumber = 8181
  return new Promise<number>((resolve) => {
    http
      .createServer((req, res) => {
        if (req.url == '/api/iam/v1/auth/refresh') {
          res.writeHead(201, {'Content-Type': 'application/json'});
          res.end();        
        }


        res.write(
          `<html><body><p>Testing</p></body></html>`
        );
      })
      .listen(portNumber);
    resolve(portNumber);
  });
};

const testResponses = [
  {url: '/api/iam/v1/auth/refresh', statusCode: 200, responseBody: ''},
]

test.describe('capture widgets tests', async () => {
  test.beforeAll(async () => {
    await startServer();
  })

  test('server @unit_test', async ({page}) => {
    await page.goto('http://localhost:8181')
    await page.waitForSelector('text=Testing')
    expect(await page.locator('text=Testing').isVisible()).toBeTruthy();    
  });

  test.only('server23 @unit_test', async ({page}) => {
    const context = await request.newContext({
      baseURL: 'http://localhost:8181/api/iam/v1/auth/refresh',
    });

    let r = await context.post('http://localhost:8181/api/iam/v1/auth/refresh');
    console.log(r)
  });

  test.only('server223 @unit_test', async ({page}) => {
    const context = await request.newContext({
      baseURL: 'http://localhost:8181/api/iam/v1/test-runs/233/tests/234/artifact-references',
    });

    let r = await context.post('http://localhost:8181/api/iam/v1/auth/refresh');
    console.log(r)
  });

})