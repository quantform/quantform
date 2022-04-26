import { BinanceAdapter } from '@quantform/binance';
import { floor, instrumentOf, Order, Session } from '@quantform/core';
import { SQLiteStorageFactory } from '@quantform/sqlite';
import {
  catchError,
  combineLatest,
  filter,
  flatMap,
  forkJoin,
  map,
  merge,
  mergeMap,
  mergeWith,
  share,
  skipUntil,
  startWith,
  switchMap,
  take,
  tap,
  withLatestFrom
} from 'rxjs';

export const descriptor = {
  adapter: [new BinanceAdapter()],
  storage: new SQLiteStorageFactory()
};

export default function (session: Session) {
  const quantity = 0.001;

  const alpha = instrumentOf('binance:lina-btc');
  const beta = instrumentOf('binance:lina-usdt');
  const gamma = instrumentOf('binance:btc-usdt');

  const income$ = combineLatest([
    session.orderbook(alpha),
    session.orderbook(beta),
    session.orderbook(gamma)
  ]).pipe(
    map(
      ([alpha, beta, gamma]) =>
        (beta.bestBidRate / gamma.bestAskRate - alpha.bestBidRate) / alpha.bestBidRate
    ),
    share()
  );

  const hasOrder$ = session.order(alpha).pipe(
    filter(it => it.instrument.toString() == alpha.toString() && it.side == 'BUY'),
    tap(it => console.log(it.id, it.state)),

    map(it => it && (it.state == 'NEW' || it.state == 'PENDING')),
    tap(it => console.log(it)),
    startWith(false)
  );

  const enter$ = combineLatest([income$, hasOrder$, session.orderbook(alpha)]).pipe(
    filter(([income, hasOrder]) => income > 0.004 && !hasOrder),
    switchMap(([, buyOrder, orderbook]) => {
      console.log(buyOrder, orderbook.bestBidRate);
      return session.open(
        Order.limit(
          alpha,
          orderbook.instrument.base.floor(quantity / orderbook.bestBidRate),
          orderbook.bestBidRate
        )
      );
    })
  );

  /*
  const beta$ = combineLatest([session.balance(beta.base), session.orderbook(beta)]).pipe(
    filter(([balance, orderbook]) => balance.free * orderbook.bestBidRate > 15),
    tap(([balance, orderbook]) =>
      session.open(
        Order.market(orderbook.instrument, -orderbook.instrument.base.floor(balance.free))
      )
    )
  );
*/
  /*  const gamma$ = combineLatest([
    session.balance(gamma.quote),
    session.orderbook(gamma)
  ]).pipe(
    filter(([balance, orderbook]) => balance.free > orderbook.bestAskRate * quantity),
    switchMap(([, orderbook]) =>
      session.open(
        Order.limit(
          orderbook.instrument,
          orderbook.instrument.base.floor(quantity),
          37000
        )
      )
    )
  );

  return gamma$;*/

  return forkJoin([enter$]);
}
