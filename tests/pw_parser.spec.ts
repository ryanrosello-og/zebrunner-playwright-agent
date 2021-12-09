import {test, expect} from '@playwright/test';
import ResultsParser from '../src/lib/ResultsParser';

test('parser', async ({page}) => {
  let resultsParser = new ResultsParser('/Users/it/repo/pw-zeb/results.json');
  await resultsParser.parse();
  let r = await resultsParser.getParsedResults();
  console.log(r);
});
