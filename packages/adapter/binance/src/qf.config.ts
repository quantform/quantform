import { instrumentOf, Order, run, task } from '@quantform/core';
import { BinanceAdapter } from './binance.adapter';

task('order-new', session => {
  return session.open(Order.buyLimit(instrumentOf('binance:mana-usdt'), 20, 2.5));
});

run({
  adapter: [new BinanceAdapter()],
  options: {
    paper: {
      balance: {}
    }
  }
});
