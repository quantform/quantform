import {
  distinctUntilChanged,
  filter,
  map,
  mergeMap,
  share,
  shareReplay,
  startWith,
  switchMap,
  take
} from 'rxjs/operators';
import {
  AssetSelector,
  Balance,
  Candle,
  Instrument,
  InstrumentSelector,
  Order,
  Position,
  Orderbook
} from '../domain';
import { Store } from '../store';
import { from, Observable } from 'rxjs';
import { Behaviour } from '../behaviour';
import { AdapterAggregate } from '../adapter/adapter-aggregate';
import { Logger, now, Worker } from '../common';
import { Trade } from '../domain/trade';
import { SessionDescriptor } from './session-descriptor';
import { Measure, Measurement } from '../storage/measurement';
import {
  AdapterHistoryQuery,
  AdapterOrderCancelCommand,
  AdapterOrderOpenCommand,
  AdapterSubscribeCommand
} from '../adapter';

export class Session {
  private initialized = false;
  private behaviour: Behaviour[] = [];
  private measurement?: Measurement;
  private worker = new Worker();

  id: number = now();

  constructor(
    readonly store: Store,
    readonly aggregate: AdapterAggregate,
    readonly descriptor?: SessionDescriptor
  ) {}

  async awake(): Promise<void> {
    if (this.initialized) {
      return;
    }

    this.initialized = true;

    await this.aggregate.awake();
    await this.descriptor?.awake(this);
  }

  async dispose(): Promise<void> {
    await this.descriptor?.dispose(this);
    await this.aggregate.dispose();
    await this.worker.wait();
  }

  measure(measure: Measure[]) {
    if (!this.measurement) {
      return;
    }

    this.worker.enqueue(() => this.measurement.write(this.id, measure));
  }

  append(...behaviour: Behaviour[]) {
    behaviour.forEach(it => {
      this.behaviour.push(it);

      it.describe(this).subscribe();
    });
  }

  statement(output: Record<string, any>) {
    for (const it of this.behaviour) {
      if (!it.statement) {
        continue;
      }

      it.statement(output);
    }
  }

  async subscribe(instrument: Array<InstrumentSelector>): Promise<void> {
    const grouped = instrument.reduce((aggregate, it) => {
      const exchange = it.base.exchange;

      if (aggregate[exchange]) {
        aggregate[exchange].push(it);
      } else {
        aggregate[exchange] = [it];
      }

      return aggregate;
    }, {});

    for (const group in grouped) {
      this.aggregate.dispatch(group, new AdapterSubscribeCommand(grouped[group]));
    }
  }

  open(...orders: Order[]): void {
    orders.forEach(it =>
      this.aggregate
        .dispatch(it.instrument.base.exchange, new AdapterOrderOpenCommand(it))
        .catch(error => Logger.error(error))
    );
  }

  cancel(order: Order): void {
    this.aggregate
      .dispatch(order.instrument.base.exchange, new AdapterOrderCancelCommand(order))
      .catch(error => Logger.error(error));
  }

  instrument(selector: InstrumentSelector): Observable<Instrument> {
    this.subscribe([selector]);

    return this.store.changes$.pipe(
      filter(it => it instanceof Instrument && it.toString() == selector.toString()),
      map(it => it as Instrument)
    );
  }

  instruments(): Observable<Instrument[]> {
    return this.store.changes$.pipe(
      filter(it => it instanceof Instrument),
      map(() => Object.values(this.store.snapshot.universe.instrument)),
      distinctUntilChanged((lhs, rhs) => lhs.length == rhs.length),
      share()
    );
  }

  trade(selector?: InstrumentSelector): Observable<Trade> {
    this.subscribe([selector]);

    return this.store.changes$.pipe(
      filter(
        it =>
          it instanceof Trade &&
          (!selector || it.instrument.toString() == selector.toString())
      ),
      map(it => it as Trade)
    );
  }

  orderbook(selector?: InstrumentSelector): Observable<Orderbook> {
    this.subscribe([selector]);

    return this.store.changes$.pipe(
      filter(
        it =>
          it instanceof Orderbook &&
          (!selector || it.instrument.toString() == selector.toString())
      ),
      map(it => it as Orderbook)
    );
  }

  position(selector?: InstrumentSelector): Observable<Position> {
    this.subscribe([selector]);

    return this.store.changes$.pipe(
      filter(
        it =>
          it instanceof Position &&
          (!selector || it.instrument.toString() == selector.toString())
      ),
      map(it => it as Position)
    );
  }

  positions(selector: InstrumentSelector): Observable<Position[]> {
    this.subscribe([selector]);

    return this.store.changes$.pipe(
      filter(
        it => it instanceof Position && it.instrument.toString() == selector.toString()
      ),
      map(() =>
        Object.values(
          this.store.snapshot.balance[selector.quote.toString()].position
        ).filter(it => it.instrument.toString() == selector.toString())
      ),
      startWith([])
    );
  }

  order(selector?: InstrumentSelector): Observable<Order> {
    this.subscribe([selector]);

    return this.store.changes$.pipe(
      filter(
        it =>
          it instanceof Order &&
          (!selector || it.instrument.toString() == selector.toString())
      ),
      map(it => it as Order)
    );
  }

  orders(selector?: InstrumentSelector): Observable<Order[]> {
    this.subscribe([selector]);

    const snapshot = this.store.snapshot;

    return this.store.changes$.pipe(
      filter(
        it =>
          it instanceof Order &&
          (!selector || it.instrument.toString() == selector.toString())
      ),
      map(() =>
        Object.values(snapshot.order.pending).filter(
          it => !selector || it.instrument.toString() == selector.toString()
        )
      ),
      startWith(
        Object.values(snapshot.order.pending).filter(
          it => !selector || it.instrument.toString() == selector.toString()
        )
      )
    );
  }

  balance(selector?: AssetSelector): Observable<Balance> {
    return this.store.changes$.pipe(
      startWith(selector ? this.store.snapshot.balance[selector.toString()] : null),
      filter(
        it =>
          it instanceof Balance &&
          (!selector || it.asset.toString() == selector.toString())
      ),
      map(it => it as Balance)
    );
  }

  history(
    selector: InstrumentSelector,
    timeframe: number,
    length: number
  ): Observable<Candle> {
    return this.store.changes$.pipe(
      startWith(this.store.snapshot.universe.instrument[selector.toString()]),
      filter(it => it instanceof Instrument && it.toString() == selector.toString()),
      switchMap(() =>
        from(
          this.aggregate.dispatch<AdapterHistoryQuery, Candle[]>(
            selector.base.exchange,
            new AdapterHistoryQuery(selector, timeframe, length)
          )
        )
      ),
      take(1),
      shareReplay(),
      mergeMap(it => it)
    );
  }
}
