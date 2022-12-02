import { Observable, take, tap } from 'rxjs';

import { binance } from '@quantform/binance';
import { awake, instrumentOf, Logger, Orderbook, rule, strategy } from '@quantform/core';
import { sqlite } from '@quantform/sqlite';

const printBestBuyOrder = () => (input$: Observable<Orderbook>) =>
  input$.pipe(
    take(1),
    tap(it => Logger.info('b', it.bids.rate.toString()))
  );

strategy('hello', () => {
  awake(session =>
    session.orderbook(instrumentOf('binance:btc-usdt')).pipe(printBestBuyOrder())
  );

  rule('listen to market trades', session =>
    session
      .trade(instrumentOf('binance:btc-usdt'))
      .pipe(tap(it => Logger.info('hello', it.instrument.quote.fixed(it.rate))))
  );

  return [binance(), sqlite()];
});
