import {
  defer,
  filter,
  finalize,
  from,
  map,
  mergeMap,
  Observable,
  shareReplay,
  startWith,
  Subscription,
  switchMap,
  take
} from 'rxjs';

import { AdapterFactory, BacktesterOptions, PaperOptions } from '../adapter';
import { AdapterAggregate } from '../adapter/adapter-aggregate';
import {
  AssetSelector,
  Balance,
  Candle,
  Instrument,
  InstrumentSelector,
  Order,
  Orderbook,
  Position,
  Trade
} from '../domain';
import { now } from '../shared';
import { StorageFactory } from '../storage';
import { Store } from '../store';
import { balance } from './balance.operator';
import { instrument, instruments } from './instrument.operator';
import { order, orders } from './order.operator';
import { orderbook } from './orderbook.operator';
import { position, positions } from './position.operator';
import { trade } from './trade.operator';

/**
 * Describes a single session.
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
  adapter: AdapterFactory[];

  /**
   * Provides historical data for backtest, it's not required for live and paper
   * sessions. Stores session variables i.e. indicators, orders, or any other type of time
   * series data. You can install @quantform/editor to render this data in your browser.
   */
  storage?: StorageFactory;

  /**
   * Session additional options.
   */
  simulation?: PaperOptions & BacktesterOptions;
}

export class Session {
  private initialized = false;
  private subscription: Subscription;

  get timestamp(): number {
    return this.store.snapshot.timestamp;
  }

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
      this.subscription = describe(this)
        .pipe(finalize(() => this.dispose()))
        .subscribe();
    }
  }

  async dispose(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = undefined;
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
   * Example of buy order:
   * session.open(Order.market(instrument, 100));
   */
  open(order: Order): Observable<Readonly<Order>> {
    return from(this.aggregate.open(order)).pipe(
      switchMap(() => this.order(order.instrument).pipe(filter(it => it.id == order.id)))
    );
  }

  /**
   * Cancels specific order.
   */
  cancel(order: Order): Observable<Readonly<Order>> {
    return defer(() => from(this.aggregate.cancel(order))).pipe(
      switchMap(() =>
        this.store.changes$.pipe(filter(it => it instanceof Order && order.id == it.id))
      ),
      map(it => it as Order)
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
  ): Observable<Readonly<Candle>> {
    return this.store.changes$.pipe(
      startWith(this.store.snapshot.universe.instrument.get(selector.id)),
      filter(it => it instanceof Instrument && it.id == selector.id),
      switchMap(() =>
        from(this.aggregate.history({ instrument: selector, timeframe, length }))
      ),
      take(1),
      shareReplay(),
      mergeMap(it => it)
    );
  }
}
