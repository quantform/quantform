import { InstrumentSelector } from '../../domain';
import { Behaviour } from '..';
import { Session } from '../../session';
import { drawdown } from '../../indicator';
import { floor, precision } from '../../common';
import { combineLatest, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

export class EquityStatementBehaviour implements Behaviour {
  private balance: number;
  private drawdown = 0;
  private equity = 0;
  private min: number;
  private max: number;

  constructor(private readonly instrument: InstrumentSelector) {}

  describe(session: Session): Observable<any> {
    return combineLatest([
      session.orderbook(this.instrument),
      session.balance(this.instrument.base),
      session.balance(this.instrument.quote),
      session.positions(this.instrument)
    ]).pipe(
      tap(([, , quote]) => {
        if (!this.balance) {
          this.balance = quote.total;
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
        if (!this.min) {
          this.min = it;
        } else {
          this.min = Math.min(this.min, it);
        }

        if (!this.max) {
          this.max = it;
        } else {
          this.max = Math.max(this.max, it);
        }

        this.equity = it;
      }),
      drawdown(it => it),
      tap(it => (this.drawdown = it))
    );
  }

  statement?(output: Record<string, any>): void {
    const pnl = this.equity / this.balance - 1;
    const scale = precision(this.equity);

    output['equity'] = this.equity;
    output['equity_min'] = this.min;
    output['equity_max'] = this.max;
    output['equity_pnl'] = floor(this.balance * pnl, scale);
    output['equity_pnl_pp'] = floor(pnl * 100, 2);
    output['equity_drawdown_pp'] = floor(this.drawdown * 100, 2);
  }
}
