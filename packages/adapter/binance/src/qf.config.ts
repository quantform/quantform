import { instrumentOf, Order, run, task } from '@quantform/core';
import { tap } from 'rxjs';
import { BinanceAdapter } from './binance.adapter';

run({
  adapter: [new BinanceAdapter()],
  options: {
    paper: {
      balance: {}
    }
  }
});

task('listen-to-orders', session => {
  return session.pending().pipe(tap(it => console.log(it)));
});

task('order-new', session => {
  return session.open(Order.buyLimit(instrumentOf('binance:mana-usdt'), 20, 2.5));
});
