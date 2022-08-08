import {
  Asset,
  Candle,
  Commission,
  instrumentOf,
  InstrumentSelector,
  Order
} from '../../domain';
import { d } from '../../shared';
import { Cache, Feed, InMemoryStorage } from '../../storage';
import { InstrumentPatchEvent, Store } from '../../store';
import {
  Adapter,
  AdapterTimeProvider,
  DefaultTimeProvider,
  FeedQuery,
  HistoryQuery
} from '../adapter';
import { PaperEngine } from '../paper/engine/paper-engine';
import { PaperAdapter } from '../paper/paper-adapter';
import { BacktesterAdapter } from './backtester-adapter';
import { BacktesterStreamer } from './backtester-streamer';

const base = new Asset('btc', 'binance', 8);
const quote = new Asset('usdt', 'binance', 4);

class DefaultAdapter extends Adapter {
  dispose(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  subscribe(instruments: InstrumentSelector[]): Promise<void> {
    throw new Error('Method not implemented.');
  }
  account(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  open(order: Order): Promise<void> {
    throw new Error('Method not implemented.');
  }
  cancel(order: Order): Promise<void> {
    throw new Error('Method not implemented.');
  }
  history(query: HistoryQuery): Promise<Candle[]> {
    throw new Error('Method not implemented.');
  }
  feed(query: FeedQuery): Promise<void> {
    throw new Error('Method not implemented.');
  }
  name = 'default';

  constructor(timeProvider: AdapterTimeProvider, private readonly store: Store) {
    super(timeProvider);
  }

  timestamp() {
    return 123;
  }

  createPaperEngine(adapter: PaperAdapter): PaperEngine {
    return new PaperEngine(adapter.store);
  }

  async awake(): Promise<void> {
    this.store.dispatch(
      new InstrumentPatchEvent(
        this.timestamp(),
        base,
        quote,
        new Commission(d(0.1), d(0.1)),
        'btc-usdt'
      )
    );
  }
}

const instrument = instrumentOf('binance:btc-usdt');
const store = new Store();
const adapter = new DefaultAdapter(DefaultTimeProvider, store);
const feed = new Feed(new InMemoryStorage());
const cache = new Cache(new InMemoryStorage());

describe('BacktesterAdapter', () => {
  test('should return proper adapter name and timestamp', () => {
    const sut = new BacktesterAdapter(
      adapter,
      new BacktesterStreamer(store, feed, {
        from: 1,
        to: 100
      }),
      store
    );

    expect(sut.name).toEqual('default');
    expect(sut.timestamp()).toEqual(1);
  });

  test('should stream data from input array', done => {
    const streamer = new BacktesterStreamer(
      store,
      feed,
      {
        from: 0,
        to: 100
      },
      {
        onBacktestCompleted: () => {
          expect(store.snapshot.timestamp).toEqual(1);
          expect(store.snapshot.trade.get(instrument.id).rate).toEqual(d(100));
          expect(store.snapshot.trade.get(instrument.id).quantity).toEqual(d(10));

          done();
        }
      }
    );

    feed.save(instrument, [new Candle(1, d(100), d(100), d(100), d(100), d(10))]);

    const sut = new BacktesterAdapter(adapter, streamer, store);

    sut.awake();
    sut.subscribe([instrument]);

    expect(sut.name).toEqual('default');
  });
});
