import {
  Asset,
  Candle,
  Commission,
  instrumentOf,
  InstrumentSelector,
  Order
} from '../../domain';
import { Cache, Feed, InMemoryStorage } from '../../storage';
import { InstrumentPatchEvent, Store, TradePatchEvent } from '../../store';
import {
  Adapter,
  AdapterTimeProvider,
  DefaultTimeProvider,
  FeedQuery,
  HistoryQuery
} from '../adapter';
import { PaperSpotSimulator } from '../paper';
import { PaperAdapter } from '../paper/paper-adapter';
import { PaperSimulator } from '../paper/simulator/paper-simulator';
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

  createPaperSimulator(adapter: PaperAdapter): PaperSimulator {
    return new PaperSpotSimulator(adapter);
  }

  async awake(): Promise<void> {
    this.store.dispatch(
      new InstrumentPatchEvent(
        this.timestamp(),
        base,
        quote,
        new Commission(0.1, 0.1),
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

describe('backtester adapter tests', () => {
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
          expect(store.snapshot.trade.get(instrument.id).rate).toEqual(100);
          expect(store.snapshot.trade.get(instrument.id).quantity).toEqual(10);

          done();
        }
      }
    );

    feed.save(instrument, [new TradePatchEvent(instrument, 100, 10, 1)]);

    const sut = new BacktesterAdapter(adapter, streamer, store);

    sut.awake();
    sut.subscribe([instrument]);

    expect(sut.name).toEqual('default');
  });
});
