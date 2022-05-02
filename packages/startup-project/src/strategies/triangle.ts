import { binance } from '@quantform/binance';
import { floor, instrumentOf, Order, Session } from '@quantform/core';
import { SQLiteStorageFactory } from '@quantform/sqlite';
import {
  catchError,
  combineLatest,
  distinctUntilChanged,
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
  adapter: [binance()],
  storage: new SQLiteStorageFactory()
};

export default function (session: Session) {
  const quantity = 0.001;

  const alpha = instrumentOf('binance:reef-btc');
  const beta = instrumentOf('binance:reef-usdt');
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
    //tap(it => console.log(it)),
    share()
  );

  const hasOrder$ = session
    .orders(alpha)
    .pipe(
      map(it =>
        it.some(
          it =>
            it.instrument.toString() == alpha.toString() &&
            it.quantity > 0 &&
            (it.state == 'NEW' || it.state == 'PENDING')
        )
      )
    );

  const enter$ = combineLatest([
    income$,
    session.balance(alpha.quote),
    session.orderbook(alpha)
  ]).pipe(
    filter(([income, hasOrder]) => income > 0.004 && hasOrder.locked === 0),
    switchMap(([, buyOrder, orderbook]) =>
      session.open(
        Order.limit(
          alpha,
          orderbook.instrument.base.floor(quantity / orderbook.bestBidRate),
          orderbook.bestBidRate
        )
      )
    )
  );

  const exit$ = combineLatest([income$, session.orders(alpha)]).pipe(
    map(([income, orders]) =>
      income <= 0.004 ? orders.find(it => it.state == 'NEW' || 'PENDING') : undefined
    ),
    filter(it => it !== undefined),
    distinctUntilChanged((lhs, rhs) => lhs.id === rhs.id),
    switchMap(it => session.cancel(it))
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

  return forkJoin([enter$, exit$]);
}
