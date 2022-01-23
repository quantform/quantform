import { assetOf, instrumentOf, Order, run, task } from '@quantform/core';
import { combineLatest, tap } from 'rxjs';
import { BinanceAdapter } from './binance.adapter';

task('order-new', session => {
  return combineLatest([
    session.trade(instrumentOf('binance:dot-usdt')),
    session.balance(assetOf('binance:dot'))
  ]).pipe(tap(([trade, balance]) => console.log(trade.rate, balance.total)));
});

run({
  adapter: [new BinanceAdapter()],
  options: {
    paper: {
      balance: {}
    }
  }
});
