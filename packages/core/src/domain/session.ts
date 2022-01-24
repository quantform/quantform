import {
  concat,
  distinctUntilChanged,
  filter,
  from,
  map,
  mergeMap,
  Observable,
  share,
  shareReplay,
  startWith,
  Subject,
  Subscription,
  switchMap,
  take
} from 'rxjs';
import { Adapter, BacktesterOptions, PaperOptions } from '../adapter';
import { AdapterAggregate } from '../adapter/adapter-aggregate';
import {
  AssetSelector,
  Balance,
  Candle,
  Instrument,
  InstrumentSelector,
  Order,
  Orderbook,
  OrderState,
  Position
} from '../domain';
import { Trade } from '../domain/trade';
import { now, Worker } from '../shared';
import { Feed, Measurement } from '../storage';
import { Store } from '../store';

type Optional<T, K extends keyof T> = Omit<T, K> & Partial<T>;

/**
 * Describes a single session.
 * You can use @run function to start a new session managed by CLI.
 * To start managed session you should install @quantform/cli package and run
 * specific command:
 *  - qf paper (to paper trade strategy)
 *  - qf backtest (to backtest strategy based on provided feed)
 *  - qf live (to live trade strategy)
 * or run on your own in code:
 *  - paper(descriptor, options)
 *  - backtest(descriptor, options)
 *  - live(descriptor)
 */
export interface SessionDescriptor {
  /**
   * Unique session identifier, used to identify session in the storage.
   * You can generate new id every time you start the new session or provide
   * session id explicitly to resume previous session (in code or via CLI).
   * If you don't provide session id, it will generate new one based on time.
   */
  id?: number;

  /**
   * Collection of adapters used to connect to the exchanges.
   */
  adapter: Adapter[];

  /**
   * Provides historical data for backtest, it's not required for live and paper
   * sessions.
   */
  feed?: Feed;

  /**
   * Stores session variables i.e. indicators, orders, or any other type of time
   * series data. You can install @quantform/editor to render this data in your browser.
   */
  measurement?: Measurement;

  /**
   * Session additional options.
   */
  options?: {
    backtester?: BacktesterOptions;
    paper?: PaperOptions;
  };
}

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
   * Opens a new order.
   * Example:
   * session.open(Order.buyMarket(instrument, 100));
   */
  open(order: Order): Observable<Order> {
    return from(this.aggregate.open(order)).pipe(
      switchMap(it =>
        this.store.changes$.pipe(filter(it => it instanceof Order && it.id == it.id))
      ),
      map(it => it as Order)
    );
  }

  /**
   * Cancels specific order.
   */
  cancel(order: Order): Observable<Order> {
    return from(this.aggregate.cancel(order)).pipe(
      switchMap(it =>
        this.store.changes$.pipe(filter(it => it instanceof Order && it.id == it.id))
      ),
      map(it => it as Order)
    );
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

  orders(selector: InstrumentSelector, states?: OrderState[]): Observable<Order[]> {
    this.subscribe([selector]);

    return this.store.changes$.pipe(
      filter(
        it =>
          it instanceof Order &&
          it.instrument.toString() == selector.toString() &&
          (!states || states.includes(it.state))
      ),
      map(() => this.store.snapshot.order),
      startWith(this.store.snapshot.order),
      map(it =>
        Object.values(it)
          .filter(
            it =>
              it.instrument.toString() == selector.toString() &&
              (states ? states.includes(it.state) : true)
          )
          .sort((lhs, rhs) => rhs.createdAt - lhs.createdAt)
      )
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
      switchMap(() =>
        from(this.aggregate.history({ instrument: selector, timeframe, length }))
      ),
      take(1),
      shareReplay(),
      mergeMap(it => it)
    );
  }
}