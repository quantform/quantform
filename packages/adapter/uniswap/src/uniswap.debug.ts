import { run, task } from '@quantform/core';
import { UniswapAdapter } from './uniswap-adapter';

run({
  adapter: [new UniswapAdapter()]
});

task('init', session => {
  console.log('ready');
});
