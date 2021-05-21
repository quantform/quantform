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
import { combineLatest, from, Observable, of } from 'rxjs';
import { Set } from 'typescript-collections';
import { Behaviour } from '../behaviour';
import {
  ExchangeHistoryRequest,
  ExchangeOrderCancelRequest,
  ExchangeOrderOpenRequest,
  ExchangeSubscribeRequest
} from '../exchange-adapter/exchange-adapter-request';
import { ExchangeAdapterAggregate } from '../exchange-adapter/exchange-adapter-aggregate';
import { Logger, now, toString } from '../common';
import { Trade } from '../domain/trade';
import { SessionDescriptor } from './session.descriptor';
import { Measure, Measurement } from './session-measurement';

export class Session {
  private initialized = false;
  private behaviour: Behaviour[] = [];
  private measurement: Measurement;

  id: string = toString(now());

  constructor(
    readonly descriptor: SessionDescriptor,
    readonly store: Store,
    readonly aggregate: ExchangeAdapterAggregate
  ) {
    this.measurement = descriptor.measurement();
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    this.initialized = true;

    await this.aggregate.initialize();

    combineLatest([
      this.store.state$.pipe(map(it => it.subscription.instrument)),
      this.store.state$.pipe(map(it => it.universe.instrument))
    ])
      .pipe(
        map(([subs, instrument]) =>
          Object.values(instrument).reduce((set, it) => {
            if (it.toString() in subs) {
              set.add(it);
            }
            return set;
          }, new Set<Instrument>())
        ),
        distinctUntilChanged((lhs, rhs) => lhs.size() == rhs.size()),
        switchMap(it => of(this.subscribe(it.toArray())))
      )
      .subscribe();
  }

  dispose(): Promise<void> {
    return Promise.resolve();
  }

  measure(measure: Measure[]) {
    if (!this.measurement) {
      return;
    }

    return this.measurement.write(this.id, measure);
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

  async subscribe(instrument: Array<Instrument>): Promise<void> {
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
      this.aggregate.execute(group, new ExchangeSubscribeRequest(grouped[group]));
    }
  }

  open(...orders: Order[]): void {
    orders.forEach(it =>
      this.aggregate
        .execute(it.instrument.base.exchange, new ExchangeOrderOpenRequest(it))
        .catch(error => Logger.error(error))
    );
  }

  cancel(order: Order): void {
    this.aggregate
      .execute(order.instrument.base.exchange, new ExchangeOrderCancelRequest(order))
      .catch(error => Logger.error(error));
  }

  instrument(selector: InstrumentSelector): Observable<Instrument> {
    this.store.subscribe(selector);

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
    this.store.subscribe(selector);

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
    this.store.subscribe(selector);

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
    this.store.subscribe(selector);

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
    this.store.subscribe(selector);

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
    this.store.subscribe(selector);

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
    this.store.subscribe(selector);

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
    this.store.subscribe(selector);

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
          this.aggregate.execute<ExchangeHistoryRequest, Candle[]>(
            selector.base.exchange,
            new ExchangeHistoryRequest(selector, timeframe, length)
          )
        )
      ),
      take(1),
      shareReplay(),
      mergeMap(it => it)
    );
  }
}
