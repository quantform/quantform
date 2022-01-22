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
  Orderbook,
  OrderState
} from '../domain';
import { Store } from '../store';
import { concat, from, Observable, Subject, Subscription } from 'rxjs';
import { AdapterAggregate } from '../adapter/adapter-aggregate';
import { Worker, now } from '../shared';
import { Trade } from '../domain/trade';
import { SessionDescriptor } from './session-descriptor';

type Optional<T, K extends keyof T> = Omit<T, K> & Partial<T>;

export class Session {
  private initialized = false;
  private subscription: Subscription;
  private worker = new Worker();

  get timestamp(): number {
    return this.store.snapshot.timestamp;
  }

  readonly statement: Record<string, Record<string, any>> = {};

  constructor(
    readonly store: Store,
    readonly aggregate: AdapterAggregate,
    readonly descriptor?: SessionDescriptor
  ) {
    // generate session id based on time if not provided.
    if (descriptor && !descriptor.id) {
      descriptor.id = now();
    }
  }

  async awake(describe: (session: Session) => Observable<any>): Promise<void> {
    if (this.initialized) {
      return;
    }

    this.initialized = true;

    // awake all adapters and synchronize trading accounts with store.
    await this.aggregate.awake();

    if (describe) {
      this.subscription = describe(this).subscribe();
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

  useStatement(section: string): Record<string, any> {
    return this.statement[section] ?? (this.statement[section] = {});
  }

  /**
   * Returns last stored measurement and setter for it in session.
   * For example you can save and restore variables in same session between runs.
   * Example usage:
   * const [order$, setOrder] = session.measurement<Order>('order');
   *
   * order.pipe(tap(it => console.log(`your last order was: ${it}`)));
   *
   * setOrder(order);
   */
  useMeasure<T extends { timestamp: number }>(
    params: { kind: string; timestamp?: number },
    defaultValue: T = undefined
  ): [Observable<T>, (value: Optional<T, 'timestamp'>) => void] {
    const stored$ = from(
      this.descriptor.measurement.query(this.descriptor.id, {
        to: params.timestamp ?? this.timestamp,
        kind: params.kind,
        count: 1
      })
    ).pipe(
      map(it =>
        it.length ? { timestamp: it[0].timestamp, ...it[0].payload } : defaultValue
      ),
      share()
    );

    const subject$ = new Subject<T>();

    const setter = (value: T) => {
      const timestamp = value.timestamp ?? this.timestamp;
      const measure = { timestamp, kind: params.kind, payload: value };

      this.worker.enqueue(() =>
        this.descriptor.measurement.save(this.descriptor.id, [measure])
      );

      subject$.next({ ...value, timestamp });
    };

    return [concat(stored$, subject$.asObservable()), setter];
  }

  /**
   * Return values for patch provided in optimization file.
   * Example usage:
   * const orderSize = session.useOptimizer('order.size');
   */
  useOptimizer(path: string): any {
    return undefined;
  }

  /**
   * Subscribes to specific instrument. Usually forces adapter to subscribe
   * for orderbook and ticker streams.
   */
  subscribe(instrument: Array<InstrumentSelector>): Promise<void> {
    return this.aggregate.subscribe(instrument);
  }

  /**
   * Opens collection of orders.
   * Example:
   * session.open(Order.buyMarket(instrument, 100));
   */
  async open(...orders: Order[]): Promise<void> {
    await Promise.all(orders.map(it => this.aggregate.open(it)));
  }

  /**
   * Cancels specific order.
   */
  cancel(order: Order): Promise<void> {
    return this.aggregate.cancel(order);
  }

  /**
   * Subscribes to specific instrument changes.
   * When adapter awake then it will fetch collection of all available instruments.
   */
  instrument(selector: InstrumentSelector): Observable<Instrument> {
    this.subscribe([selector]);

    return this.store.changes$.pipe(
      filter(it => it instanceof Instrument && it.toString() == selector.toString()),
      map(it => it as Instrument)
    );
  }

  /**
   * Subscribes to instruments changes.
   * When adapter awake then it will fetch collection of all available instruments.
   */
  instruments(): Observable<Instrument[]> {
    return this.store.changes$.pipe(
      filter(it => it instanceof Instrument),
      map(() => Object.values(this.store.snapshot.universe.instrument)),
      startWith(Object.values(this.store.snapshot.universe.instrument)),
      filter(it => it.length > 0),
      distinctUntilChanged((lhs, rhs) => lhs.length == rhs.length)
    );
  }

  /**
   * Subscribes to trade/ticker changes.
   */
  trade(selector: InstrumentSelector): Observable<Trade> {
    this.subscribe([selector]);

    return this.store.changes$.pipe(
      filter(
        it => it instanceof Trade && it.instrument.toString() == selector.toString()
      ),
      map(it => it as Trade)
    );
  }

  /**
   * Subscribes to orderbook changes.
   * Right now you can access only best bid and best ask.
   */
  orderbook(selector: InstrumentSelector): Observable<Orderbook> {
    this.subscribe([selector]);

    return this.store.changes$.pipe(
      filter(
        it => it instanceof Orderbook && it.instrument.toString() == selector.toString()
      ),
      map(it => it as Orderbook)
    );
  }

  /**
   * Subscribes to position on leveraged market.
   */
  position(selector: InstrumentSelector): Observable<Position> {
    this.subscribe([selector]);

    return this.store.changes$.pipe(
      filter(
        it => it instanceof Position && it.instrument.toString() == selector.toString()
      ),
      map(it => it as Position)
    );
  }

  /**
   * Subscribes to positions on leveraged markets.
   */
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

  order(selector: InstrumentSelector): Observable<Order> {
    this.subscribe([selector]);

    return this.store.changes$.pipe(
      filter(
        it => it instanceof Order && it.instrument.toString() == selector.toString()
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

  balance(selector: AssetSelector): Observable<Balance> {
    return this.store.changes$.pipe(
      startWith(this.store.snapshot.balance[selector.toString()]),
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
      switchMap(() => from(this.aggregate.history(selector, timeframe, length))),
      take(1),
      shareReplay(),
      mergeMap(it => it)
    );
  }
}
