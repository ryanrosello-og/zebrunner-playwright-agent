type result = {
  status: 'ok' | 'failed';
  errorMessage?: string;
};

export function runPreChecks(): result {
  let errors = [];

  if (!process.env.BASE_URL) {
    errors.push('Environment variable: [BASE_URL] was not defined');
  }

  if (!process.env.ACCESS_TOKEN) {
    errors.push('Environment variable: [ACCESS_TOKEN] was not defined');
  }

  if (!process.env.PROJECT_KEY) {
    errors.push('Environment variable: [PROJECT_KEY] was not defined');
  }

  // TODO: RESULTS_FILE
  // exists
  // is parseable
  // can connect

  if (errors.length > 0) {
    return {
      status: 'failed',
      errorMessage: `${errors.join('|')}`,
    };
  }
  return {
    status: 'ok',
  };
}
