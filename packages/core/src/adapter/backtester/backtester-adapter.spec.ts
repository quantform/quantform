import { expect, test, describe } from '@jest/globals';
import { AdapterSubscribeCommand } from '..';
import { instrumentOf } from '../../domain';
import { InMemoryFeed } from '../../storage';
import { Store } from '../../store';
import { TradePatchEvent } from '../../store/event';
import { Adapter } from '../adapter';
import { PaperSpotModel } from '../paper';
import { PaperModel } from '../paper/model/paper-model';
import { PaperAdapter } from '../paper/paper-adapter';
import { BacktesterAdapter } from './backtester-adapter';
import { BacktesterStreamer } from './backtester-streamer';

class DefaultAdapter extends Adapter {
  name = 'default';

  timestamp() {
    return 123;
  }

  createPaperModel(adapter: PaperAdapter): PaperModel {
    return new PaperSpotModel(adapter);
  }
}

const adapter = new DefaultAdapter();
const store = new Store();
const feed = new InMemoryFeed();
const options = {
  balance: {
    ['binance:usdt']: 1000
  },
  from: 1,
  to: 100
};

const streamer = new BacktesterStreamer(store, feed, options);

describe('backtester adapter tests', () => {
  test('should return proper adapter name and timestamp', () => {
    const sut = new BacktesterAdapter(adapter, streamer);

    expect(sut.name).toEqual('default');
    expect(sut.timestamp()).toEqual(1);
  });

  test('should stream data from input array', () => {
    const instrument = instrumentOf('binance:btc-usdt');

    feed.write(instrumentOf('binance:btc-usdt'), [
      new TradePatchEvent(instrument, 100, 10, 1)
    ]);

    const sut = new BacktesterAdapter(adapter, streamer);

    sut.dispatch(new AdapterSubscribeCommand([instrument]), {
      store,
      timestamp: sut.timestamp()
    });

    expect(sut.name).toEqual('default');
    expect(sut.timestamp()).toEqual(1);
    expect(store.snapshot.timestamp).toEqual(1);
    expect(store.snapshot.trade[instrument.toString()].rate).toEqual(100);
    expect(store.snapshot.trade[instrument.toString()].quantity).toEqual(10);
  });
});
