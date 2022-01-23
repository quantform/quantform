import { combineLatest, finalize, map, take, tap } from 'rxjs';
import { InstrumentSelector, Session } from '.';
import { drawdown } from '../indicator';
import { floor, precision } from '../shared';

export function period() {
  return (session: Session) => {
    const period = session.useStatement('period');

    return session.store.changes$.pipe(
      finalize(() => (period.to = new Date(session.timestamp).toISOString())),
      take(1),
      tap(it => (period.from = new Date(it.timestamp).toISOString()))
    );
  };
}

export function benchmark(instrument: InstrumentSelector) {
  return (session: Session) => {
    const statement = session.useStatement('benchmark');

    let balance: number, entry: number, exit: number;
    let dd = 0;

    return combineLatest([
      session.orderbook(instrument),
      session.balance(instrument.quote),
      session.orderbook(instrument).pipe(
        drawdown(it => it.midRate),
        tap(it => (dd = it))
      )
    ]).pipe(
      map(([orderbook, quote]) => {
        const price = orderbook.midRate;

        if (!balance) {
          balance = quote.total;
        }

        if (!entry) {
          entry = price;
        }

        exit = price;
      }),
      finalize(() => {
        const pnl = exit / entry - 1;

        statement['benchmark_entry'] = entry;
        statement['benchmark_exit'] = exit;
        statement['benchmark_pnl'] = floor(balance * pnl, precision(entry));
        statement['benchmark_pnl_pp'] = floor(pnl * 100, 2);
        statement['benchmark_drawdown_pp'] = floor(dd * 100, 2);
      })
    );
  };
}

export function equity(instrument: InstrumentSelector) {
  return (session: Session) => {
    const statement = session.useStatement('benchmark');

    let balance: number, min: number, max: number;
    let dd = 0;
    let equity = 0;

    return combineLatest([
      session.orderbook(instrument),
      session.balance(instrument.base),
      session.balance(instrument.quote),
      session.positions(instrument)
    ]).pipe(
      tap(([, , quote]) => {
        if (!balance) {
          balance = quote.total;
        }
      }),
      map(([orderbook, base, quote, positions]) =>
        orderbook.instrument.quote.fixed(
          quote.total +
            base.total * orderbook.bestBidRate +
            positions.reduce(
              (agg, position) => agg + position.calculatePnL(orderbook.bestBidRate),
              0
            )
        )
      ),
      tap(it => {
        if (!min) {
          min = it;
        } else {
          min = Math.min(min, it);
        }

        if (!max) {
          max = it;
        } else {
          max = Math.max(max, it);
        }

        equity = it;
      }),
      drawdown(it => it),
      tap(it => (dd = it)),
      finalize(() => {
        const pnl = equity / balance - 1;
        const scale = precision(equity);

        statement['equity'] = equity;
        statement['equity_min'] = min;
        statement['equity_max'] = max;
        statement['equity_pnl'] = floor(balance * pnl, scale);
        statement['equity_pnl_pp'] = floor(pnl * 100, 2);
        statement['equity_drawdown_pp'] = floor(dd * 100, 2);
      })
    );
  };
}
