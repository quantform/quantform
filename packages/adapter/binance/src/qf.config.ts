import { run } from '@quantform/core';

import { BinanceAdapter } from './binance.adapter';

run({
  adapter: [new BinanceAdapter()],
  options: {
    paper: {
      balance: {}
    }
  }
});
