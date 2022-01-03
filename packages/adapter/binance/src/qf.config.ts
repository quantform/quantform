import { instrumentOf, Order, run, task } from '@quantform/core';
import { BinanceAdapter } from '@quantform/binance';
import { tap } from 'rxjs';

task('listen-to-orders', session => {
  return session.pending().pipe(tap(it => console.log(it)));
});

run({
  adapter: [new BinanceAdapter()],
  options: {
    paper: {
      balance: {}
    }
  }
});
