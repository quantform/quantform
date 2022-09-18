import { Observable } from 'rxjs';
import { AdapterFactory, BacktesterOptions, PaperOptions } from '../adapter';
import { AdapterAggregate } from '../adapter/adapter-aggregate';
import { AssetSelector, Balance, Candle, Instrument, InstrumentSelector, Order, Orderbook, Position, Trade } from '../domain';
import { decimal } from '../shared';
import { StorageFactory } from '../storage';
import { Store } from '../store';
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
export declare class Session {
    readonly store: Store;
    readonly aggregate: AdapterAggregate;
    readonly descriptor?: SessionDescriptor | undefined;
    private initialized;
    private subscription;
    get timestamp(): number;
    constructor(store: Store, aggregate: AdapterAggregate, descriptor?: SessionDescriptor | undefined);
    awake(describe: (session: Session) => Observable<void>): Promise<void>;
    dispose(): Promise<void>;
    /**
     * Subscribes to specific instrument. Usually forces adapter to subscribe
     * for orderbook and ticker streams.
     */
    subscribe(instrument: Array<InstrumentSelector>): Promise<void>;
    /**
     * Opens a new order.
     */
    open(order: {
        instrument: InstrumentSelector;
        quantity: decimal;
        rate?: decimal;
    }): Observable<Readonly<Order>>;
    /**
     * Cancels specific order.
     */
    cancel(order: Order): Observable<Readonly<Order>>;
    /**
     * Subscribes to specific instrument changes.
     * When adapter awake then it will fetch collection of all available instruments.
     */
    instrument(selector: InstrumentSelector): Observable<Readonly<Instrument>>;
    /**
     * Subscribes to instruments changes.
     * When adapter awake then it will fetch collection of all available instruments.
     */
    instruments(): Observable<Readonly<Instrument[]>>;
    /**
     * Subscribes to balance changes.
     */
    balance(selector: AssetSelector): Observable<Readonly<Balance>>;
    /**
     * Subscribes to trade/ticker changes.
     */
    trade(selector: InstrumentSelector): Observable<Readonly<Trade>>;
    /**
     * Subscribes to orderbook changes.
     * Right now you can access only best bid and best ask.
     */
    orderbook(selector: InstrumentSelector): Observable<Readonly<Orderbook>>;
    /**
     * Subscribes to position on leveraged market.
     */
    position(selector: InstrumentSelector): Observable<Readonly<Position>>;
    /**
     * Subscribes to positions on leveraged markets.
     */
    positions(selector: InstrumentSelector): Observable<Readonly<Position[]>>;
    order(selector: InstrumentSelector): Observable<Readonly<Order>>;
    orders(selector: InstrumentSelector): Observable<Readonly<Order[]>>;
    history(selector: InstrumentSelector, timeframe: number, length: number): Observable<Readonly<Candle>>;
}
//# sourceMappingURL=session.d.ts.map