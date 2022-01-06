const portNumber = 8181;
const projectKey = 'TEST';
const testRunId = 1000;
const testId = 942;
const sessionId = '3706ef44-605c-4c53-8ac7-b4230e058f47';
const http = require('https')

const startServer = async () => {
  return new Promise((resolve) => {
    http
      .createServer((req, res) => {
        let responseCode;
        let responseBody = {};
        switch (req.url) {
          case '/api/iam/v1/auth/refresh':
            responseCode = 200;
            break;
          case `/api/reporting/v1/test-runs?projectKey=${projectKey}`:
            responseCode = 200;
            responseBody = {id:testRunId};
            break;
          case `/api/reporting/v1/test-runs/${testRunId}`:
            responseCode = 200;
            break;
          case `/api/reporting/v1/test-runs/${testRunId}/tests`:
            responseCode = 200;
            responseBody = {id:testId};
            break;
          case `/api/reporting/v1/test-runs/${testRunId}/tests/${testId}`:
            responseCode = 200;
            break;
          case `/api/reporting/v1/test-runs/${testRunId}/test-sessions`:
            responseCode = 200;
            break;
          case `/api/reporting/v1/test-runs/${testRunId}/labels`:
            responseCode = 204;
            break;
          case `/api/reporting/v1/test-runs/${testRunId}/test-sessions/${sessionId}`:
            responseCode = 200;
            break;
          case `/api/reporting/v1/test-runs/${testRunId}/tests/${testId}/screenshots`:
            responseCode = 201;
            break;
          // // case `/api/reporting/v1/test-runs/${testRunId}/tests/${testId}/artifacts`:
          // //   responseCode = 201;
          // //   break;
          // // case `/api/reporting/v1/test-runs/${testRunId}/test-sessions/${testSessionId}/artifacts`:
          // //   responseCode = 201;
          // //   break;  
          case `/api/reporting/v1/test-runs/${testRunId}/tests/${testId}/labels`:
            responseCode = 204;
            break;
          case `/api/reporting/v1/test-runs/${testRunId}/logs`:
            responseCode = 202;
            break;
          default:
            responseCode = 404;
        }
        res.writeHead(responseCode, {'Content-Type': 'application/json'});
        if (responseBody !== '') {
          res.write(JSON.stringify(responseBody));
        }
        res.end();
      })
      .listen(portNumber);
    resolve(portNumber);
  });
};

startServer().then(f => {
  console.log(f)
})