import { BacktesterStreamer } from '@lib/adapter';
import { Asset, Commission, Instrument } from '@lib/component';
import { d } from '@lib/shared';
import { Feed, InMemoryStorage } from '@lib/storage';
import { Store, TradePatchEvent } from '@lib/store';

describe(BacktesterStreamer.name, () => {
  const instrument = new Instrument(
    0,
    new Asset('btc', 'binance', 8),
    new Asset('usdt', 'binance', 2),
    'binance:btc-usdt',
    Commission.Zero
  );

  test('should repeat specific events', done => {
    const feed = new Feed(new InMemoryStorage());
    const store = new Store();

    store.snapshot.universe.instrument.upsert(instrument);
    store.snapshot.subscription.instrument.upsert(instrument);

    const streamer = new BacktesterStreamer(
      store,
      feed,
      {
        from: 0,
        to: 10
      },
      {
        onBacktestCompleted: () => {
          const trade = store.snapshot.trade.get(instrument.id) ?? fail();

          expect(trade.timestamp).toEqual(8);
          expect(trade.rate).toEqual(d(8));
          expect(trade.quantity).toEqual(d(8));
          expect(store.snapshot.timestamp).toEqual(8);

          done();
        }
      }
    );

    feed
      .save([
        new TradePatchEvent(instrument, d(1), d(1), 1),
        new TradePatchEvent(instrument, d(2), d(2), 2),
        new TradePatchEvent(instrument, d(3), d(3), 3),
        new TradePatchEvent(instrument, d(4), d(4), 4),
        new TradePatchEvent(instrument, d(5), d(5), 5),
        new TradePatchEvent(instrument, d(6), d(6), 6),
        new TradePatchEvent(instrument, d(7), d(7), 7),
        new TradePatchEvent(instrument, d(8), d(8), 8)
      ])
      .then(() => {
        streamer.subscribe(instrument);
        streamer.tryContinue();
      });
  });
});
