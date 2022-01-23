import { Adapter, AdapterContext } from '../adapter/adapter';
import { BacktesterAdapter } from '../adapter/backtester/backtester-adapter';
import { BacktesterStreamer } from '../adapter/backtester/backtester-streamer';
import { PaperSpotSimulator } from '../adapter/paper';
import { PaperAdapter } from '../adapter/paper/paper-adapter';
import { PaperSimulator } from '../adapter/paper/simulator/paper-simulator';
import { Asset, Commission, instrumentOf } from '../domain';
import { Feed, InMemoryStorage } from '../storage';
import { InstrumentPatchEvent, Store, TradePatchEvent } from '../store';

const base = new Asset('btc', 'binance', 8);
const quote = new Asset('usdt', 'binance', 4);

class DefaultAdapter extends Adapter {
  name = 'default';

  timestamp() {
    return 123;
  }

  createPaperSimulator(adapter: PaperAdapter): PaperSimulator {
    return new PaperSpotSimulator(adapter);
  }

  async awake(context: AdapterContext): Promise<void> {
    await super.awake(context);

    context.dispatch(
      new InstrumentPatchEvent(
        context.timestamp,
        base,
        quote,
        new Commission(0.1, 0.1),
        'btc-usdt'
      )
    );
  }
}

const instrument = instrumentOf('binance:btc-usdt');
const adapter = new DefaultAdapter();
const store = new Store();
const feed = new Feed(new InMemoryStorage());

describe('backtester adapter tests', () => {
  test('should return proper adapter name and timestamp', () => {
    const sut = new BacktesterAdapter(
      adapter,
      new BacktesterStreamer(store, feed, {
        balance: {
          ['binance:usdt']: 1000
        },
        from: 1,
        to: 100
      })
    );

    expect(sut.name).toEqual('default');
    expect(sut.timestamp()).toEqual(1);
  });

  test('should stream data from input array', done => {
    const streamer = new BacktesterStreamer(
      store,
      feed,
      {
        balance: {
          ['binance:usdt']: 1000
        },
        from: 0,
        to: 100
      },
      {
        onBacktestCompleted: () => {
          expect(store.snapshot.timestamp).toEqual(1);
          expect(store.snapshot.trade[instrument.toString()].rate).toEqual(100);
          expect(store.snapshot.trade[instrument.toString()].quantity).toEqual(10);

          done();
        }
      }
    );

    feed.save(instrument, [new TradePatchEvent(instrument, 100, 10, 1)]);

    const sut = new BacktesterAdapter(adapter, streamer);

    sut.awake(new AdapterContext(sut, store));
    sut.subscribe([instrument]);

    expect(sut.name).toEqual('default');
  });
});
