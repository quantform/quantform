import { run, task } from '@quantform/core';
import { of } from 'rxjs';
import { UniswapAdapter } from './uniswap-adapter';

task('test', session => {
  return of(1);
});

run({
  adapter: [new UniswapAdapter()],
  options: {
    paper: {
      balance: {}
    }
  }
});
