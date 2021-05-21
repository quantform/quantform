import { combineLatest, Observable } from 'rxjs';
import { Balance, InstrumentSelector, Orderbook } from '../../domain';
import { Behaviour } from '..';
import { Session } from '../../session';
import { floor, precision } from '../../common';
import { map, tap } from 'rxjs/operators';
import { drawdown } from '../../indicator';

export class BenchmarkStatementBehaviour implements Behaviour {
  private balance: number;
  private entry: number;
  private exit: number;

  private drawdown = 0;

  constructor(private readonly instrument: InstrumentSelector) {}

  describe(session: Session): Observable<any> {
    return combineLatest([
      session.orderbook(this.instrument),
      session.balance(this.instrument.quote),
      session.orderbook(this.instrument).pipe(
        drawdown(it => it.midRate),
        tap(it => (this.drawdown = it))
      )
    ]).pipe(map(it => this.update(it[0], it[1])));
  }

  private update(orderbook: Orderbook, quote: Balance): void {
    const price = orderbook.midRate;

    if (!this.balance) {
      this.balance = quote.total;
    }

    if (!this.entry) {
      this.entry = price;
    }

    this.exit = price;
  }

  statement?(output: Record<string, any>): void {
    const pnl = this.exit / this.entry - 1;
    const scale = precision(this.entry);

    output['benchmark_entry'] = this.entry;
    output['benchmark_exit'] = this.exit;
    output['benchmark_pnl'] = floor(this.balance * pnl, scale);
    output['benchmark_pnl_pp'] = floor(pnl * 100, 2);
    output['benchmark_drawdown_pp'] = floor(this.drawdown * 100, 2);
  }
}
