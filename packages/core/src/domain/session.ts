import {
  concat,
  defer,
  filter,
  from,
  map,
  mergeMap,
  Observable,
  of,
  ReplaySubject,
  share,
  shareReplay,
  startWith,
  switchMap,
  take
} from 'rxjs';
import { v4 } from 'uuid';

import { AdapterAggregate } from '../adapter/adapter-aggregate';
import {
  AssetSelector,
  Balance,
  Instrument,
  InstrumentSelector,
  invalidInstrumentSelectorError,
  Ohlc,
  Order,
  Orderbook,
  Position,
  Trade
} from '../domain';
import { decimal } from '../shared';
import { Measurement } from '../storage';
import { Store } from '../store';
import { balance } from './balance-operator';
import { instrument, instruments } from './instrument-operator';
import { order, orders } from './order-operator';
import { orderbook } from './orderbook-operator';
import { position, positions } from './position-operator';
import { trade } from './trade-operator';

type Optional<T, K extends keyof T> = Omit<T, K> & Partial<T>;

export class Session {
  private initialized = false;

  get timestamp(): number {
    return this.store.snapshot.timestamp;
  }

  constructor(
    readonly id: number,
    readonly store: Store,
    readonly aggregate: AdapterAggregate,
    readonly measurement: Measurement | undefined
  ) {}

  async awake(): Promise<void> {
    if (this.initialized) {
      return;
    }

    this.initialized = true;

    // awake all adapters and synchronize trading accounts with store.
    await this.aggregate.awake();
  }

  async dispose(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    this.store.dispose();

    await this.aggregate.dispose();

    this.initialized = false;
  }

  /**
   * Subscribes to specific instrument. Usually forces adapter to subscribe
   * for orderbook and ticker streams.
   */
  subscribe(instrument: Array<InstrumentSelector>): Promise<void> {
    return this.aggregate.subscribe(instrument);
  }

  /**
   * Opens a new order.
   */
  open(order: {
    instrument: InstrumentSelector;
    quantity: decimal;
    rate?: decimal;
  }): Observable<Readonly<Order>> {
    const instrument = this.store.snapshot.universe.instrument.get(order.instrument.id);
    if (!instrument) {
      throw invalidInstrumentSelectorError(order.instrument.id);
    }

    const newOrder = new Order(
      this.timestamp,
      v4(),
      instrument,
      order.quantity,
      this.timestamp,
      order.rate
    );

    return of(newOrder).pipe(
      switchMap(() => this.aggregate.open(newOrder)),
      switchMap(() =>
        this.order(order.instrument).pipe(filter(it => it.id == newOrder.id))
      )
    );
  }

  /**
   * Cancels specific order.
   */
  cancel(order: Order): Observable<Readonly<Order>> {
    return defer(() => from(this.aggregate.cancel(order))).pipe(
      switchMap(() => this.order(order.instrument).pipe(filter(it => it.id == order.id)))
    );
  }

  /**
   * Subscribes to specific instrument changes.
   * When adapter awake then it will fetch collection of all available instruments.
   */
  instrument(selector: InstrumentSelector): Observable<Readonly<Instrument>> {
    this.subscribe([selector]);

    return this.store.changes$.pipe(instrument(selector, this.store.snapshot));
  }

  /**
   * Subscribes to instruments changes.
   * When adapter awake then it will fetch collection of all available instruments.
   */
  instruments(): Observable<Readonly<Instrument[]>> {
    return this.store.changes$.pipe(instruments(this.store.snapshot));
  }

  /**
   * Subscribes to balance changes.
   */
  balance(selector: AssetSelector): Observable<Readonly<Balance>> {
    return this.store.changes$.pipe(balance(selector, this.store.snapshot));
  }

  /**
   * Subscribes to trade/ticker changes.
   */
  trade(selector: InstrumentSelector): Observable<Readonly<Trade>> {
    this.subscribe([selector]);

    return this.store.changes$.pipe(trade(selector, this.store.snapshot));
  }

  /**
   * Subscribes to orderbook changes.
   * Right now you can access only best bid and best ask.
   */
  orderbook(selector: InstrumentSelector): Observable<Readonly<Orderbook>> {
    this.subscribe([selector]);

    return this.store.changes$.pipe(orderbook(selector, this.store.snapshot));
  }

  /**
   * Subscribes to position on leveraged market.
   */
  position(selector: InstrumentSelector): Observable<Readonly<Position>> {
    this.subscribe([selector]);

    return this.store.changes$.pipe(position(selector));
  }

  /**
   * Subscribes to positions on leveraged markets.
   */
  positions(selector: InstrumentSelector): Observable<Readonly<Position[]>> {
    this.subscribe([selector]);

    return this.store.changes$.pipe(positions(selector, this.store.snapshot));
  }

  order(selector: InstrumentSelector): Observable<Readonly<Order>> {
    this.subscribe([selector]);

    return this.store.changes$.pipe(order(selector));
  }

  orders(selector: InstrumentSelector): Observable<Readonly<Order[]>> {
    this.subscribe([selector]);

    return this.store.changes$.pipe(orders(selector, this.store.snapshot));
  }

  history(
    selector: InstrumentSelector,
    timeframe: number,
    length: number
  ): Observable<Readonly<Ohlc>> {
    return this.store.changes$.pipe(
      startWith(this.store.snapshot.universe.instrument.get(selector.id)),
      filter(it => it instanceof Instrument && it.id == selector.id),
      switchMap(() => from(this.aggregate.history(selector, timeframe, length))),
      take(1),
      shareReplay(),
      mergeMap(it => it)
    );
  }

  measure<T extends { timestamp: number }>(
    spec: {
      kind: string;
      timestamp?: number;
    },
    defaultValue?: Optional<T, 'timestamp'>
  ): [Observable<T>, (value: T) => void] {
    if (!this.measurement) {
      throw new Error();
    }

    const changes$ = new ReplaySubject<Optional<T, 'timestamp'>>();
    const persisted$ = from(
      this.measurement.query(this.id, {
        to: spec.timestamp ?? this.timestamp,
        kind: spec.kind,
        count: 1
      })
    ).pipe(
      map(it =>
        it.length ? { timestamp: it[0].timestamp, ...it[0].payload } : defaultValue
      ),
      share()
    );

    const setter = (value: Optional<T, 'timestamp'>) => {
      const timestamp = value.timestamp ?? this.timestamp;
      const measure = { timestamp, kind: spec.kind, payload: value };

      this.measurement?.save(this.id, [measure]);

      changes$.next({ ...value, timestamp });
    };

    return [
      concat(persisted$, changes$.asObservable()).pipe(filter(it => it !== undefined)),
      setter
    ];
  }
}
