import { AdapterAwakeCommand } from '../adapter';
import { AdapterSubscribeCommand } from '../adapter';
import { Asset, Commision, instrumentOf } from '../domain';
import { InMemoryFeed } from '../storage';
import { Store } from '../store';
import { InstrumentPatchEvent, TradePatchEvent } from '../store/event';
import { Adapter, AdapterContext } from '../adapter/adapter';
import { PaperSpotModel } from '../adapter/paper';
import { PaperModel } from '../adapter/paper/model/paper-model';
import { PaperAdapter } from '../adapter/paper/paper-adapter';
import { BacktesterAdapter } from '../adapter/backtester/backtester-adapter';
import { BacktesterStreamer } from '../adapter/backtester/backtester-streamer';
import { handler } from '../common';

const base = new Asset('btc', 'binance', 8);
const quote = new Asset('usdt', 'binance', 4);

class DefaultAdapter extends Adapter {
  name = 'default';

  timestamp() {
    return 123;
  }

  createPaperModel(adapter: PaperAdapter): PaperModel {
    return new PaperSpotModel(adapter);
  }

  @handler(AdapterAwakeCommand)
  onAwake(command: AdapterAwakeCommand, context: AdapterContext) {
    console.log(context.timestamp);
    context.store.dispatch(
      new InstrumentPatchEvent(
        context.timestamp,
        base,
        quote,
        new Commision(0.1, 0.1),
        'btc-usdt'
      )
    );
  }
}

const instrument = instrumentOf('binance:btc-usdt');
const adapter = new DefaultAdapter();
const store = new Store();
const feed = new InMemoryFeed();

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
    const streamer = new BacktesterStreamer(store, feed, {
      balance: {
        ['binance:usdt']: 1000
      },
      from: 0,
      to: 100,
      completed: () => {
        expect(store.snapshot.timestamp).toEqual(1);
        expect(store.snapshot.trade[instrument.toString()].rate).toEqual(100);
        expect(store.snapshot.trade[instrument.toString()].quantity).toEqual(10);

        done();
      }
    });

    feed.write(instrument, [new TradePatchEvent(instrument, 100, 10, 1)]);

    const sut = new BacktesterAdapter(adapter, streamer);

    sut.dispatch(new AdapterAwakeCommand(), {
      store,
      timestamp: sut.timestamp()
    });

    sut.dispatch(new AdapterSubscribeCommand([instrument]), {
      store,
      timestamp: sut.timestamp()
    });

    expect(sut.name).toEqual('default');
    expect(sut.timestamp()).toEqual(1);
  });
});
