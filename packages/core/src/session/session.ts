import {
  distinctUntilChanged,
  filter,
  map,
  mergeMap,
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
  Orderbook,
  OrderState
} from '../domain';
import { Store } from '../store';
import { from, Observable, Subscription } from 'rxjs';
import { Behaviour, CombinedBehaviour, FunctionBehaviour } from '../behaviour';
import { AdapterAggregate } from '../adapter/adapter-aggregate';
import { Worker } from '../common';
import { Trade } from '../domain/trade';
import { SessionDescriptor } from './session-descriptor';
import { Measure } from '../storage/measurement';
import {
  AdapterHistoryQuery,
  AdapterOrderCancelCommand,
  AdapterOrderOpenCommand,
  AdapterSubscribeCommand
} from '../adapter';

export class Session {
  private initialized = false;
  private subscription: Subscription;
  private behaviour: Behaviour;
  private worker = new Worker();

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

    await this.aggregate.awake(this.descriptor != null);

    if (this.descriptor?.behaviour) {
      if (this.descriptor.behaviour instanceof Function) {
        this.behaviour = new FunctionBehaviour(this.descriptor.behaviour);
      } else {
        this.behaviour = Array.isArray(this.descriptor.behaviour)
          ? new CombinedBehaviour(this.descriptor.behaviour)
          : this.descriptor.behaviour;
      }

      this.subscription = this.behaviour.describe(this).subscribe();
    }
  }

  async dispose(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    this.store.dispose();

    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    await this.aggregate.dispose();
    await this.worker.wait();
  }

  statement(output: Record<string, any>) {
    if (!this.behaviour?.statement) {
      return;
    }

    this.behaviour.statement(output);
  }

  useMeasure<T extends Measure>(
    params: { key: string; timestamp?: number },
    defaultValue: T = undefined
  ): [Observable<T>, (value: T) => void] {
    const query$ = from(
      this.descriptor.measurement.query(this.descriptor.id, {
        type: params.key,
        timestamp: params.timestamp ?? this.store.snapshot.timestamp,
        limit: 1,
        direction: 'BACKWARD'
      })
    ).pipe(map(it => (it.length ? (it[0] as T) : defaultValue)));

    const setter = (value: T) => {
      this.worker.enqueue(() =>
        this.descriptor.measurement.save(this.descriptor.id, [value])
      );
    };

    return [query$, setter];
  }

  useOptimizer(path: string): any {
    return 0;
  }

  async subscribe(instrument: Array<InstrumentSelector>): Promise<void> {
    const grouped = instrument
      .filter(it => it != null)
      .reduce((aggregate, it) => {
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

  async open(...orders: Order[]): Promise<void> {
    await Promise.all(
      orders.map(it =>
        this.aggregate.dispatch<AdapterOrderOpenCommand, void>(
          it.instrument.base.exchange,
          new AdapterOrderOpenCommand(it)
        )
      )
    );
  }

  cancel(order: Order): Promise<void> {
    return this.aggregate.dispatch(
      order.instrument.base.exchange,
      new AdapterOrderCancelCommand(order)
    );
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
      startWith(Object.values(this.store.snapshot.universe.instrument)),
      filter(it => it.length > 0),
      distinctUntilChanged((lhs, rhs) => lhs.length == rhs.length)
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

  private ordersOf(
    orders: Order[],
    states: OrderState[],
    selector?: InstrumentSelector
  ): Observable<Order[]> {
    this.subscribe([selector]);

    return this.store.changes$.pipe(
      filter(
        it =>
          it instanceof Order &&
          (!selector || it.instrument.toString() == selector.toString()) &&
          (states.indexOf(it.state) >= 0 || states.length == 0)
      ),
      map(() =>
        Object.values(orders)
          .filter(it => !selector || it.instrument.toString() == selector.toString())
          .sort((lhs, rhs) => rhs.createdAt - lhs.createdAt)
      ),
      startWith(
        Object.values(orders)
          .filter(it => !selector || it.instrument.toString() == selector.toString())
          .sort((lhs, rhs) => rhs.createdAt - lhs.createdAt)
      )
    );
  }

  pending(selector?: InstrumentSelector): Observable<Order[]> {
    return this.ordersOf(
      Object.values(this.store.snapshot.order.pending),
      ['PENDING', 'NEW'],
      selector
    );
  }

  filled(selector?: InstrumentSelector): Observable<Order[]> {
    return this.ordersOf(
      Object.values(this.store.snapshot.order.filled),
      ['FILLED'],
      selector
    );
  }

  canceled(selector?: InstrumentSelector): Observable<Order[]> {
    return this.ordersOf(
      Object.values(this.store.snapshot.order.canceled),
      ['CANCELING', 'CANCELED'],
      selector
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
