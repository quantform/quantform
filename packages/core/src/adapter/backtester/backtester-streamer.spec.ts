import { Asset, Candle, Instrument } from '../../domain';
import { decimal } from '../../shared';
import { Feed, InMemoryStorage } from '../../storage';
import { Store } from '../../store';
import { BacktesterStreamer } from './backtester-streamer';

describe('BacktesterStreamer', () => {
  const instrument = new Instrument(
    new Asset('btc', 'binance', 8),
    new Asset('usdt', 'binance', 2),
    'binance:btc-usdt'
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
          const trade = store.snapshot.trade.get(instrument.id);

          expect(trade.timestamp).toEqual(8);
          expect(trade.rate).toEqual(new decimal(8));
          expect(trade.quantity).toEqual(new decimal(8));
          expect(store.snapshot.timestamp).toEqual(8);

          done();
        }
      }
    );

    feed
      .save(instrument, [
        new Candle(
          1,
          new decimal(1),
          new decimal(1),
          new decimal(1),
          new decimal(1),
          new decimal(1)
        ),
        new Candle(
          2,
          new decimal(2),
          new decimal(2),
          new decimal(2),
          new decimal(2),
          new decimal(2)
        ),
        new Candle(
          3,
          new decimal(3),
          new decimal(3),
          new decimal(3),
          new decimal(3),
          new decimal(3)
        ),
        new Candle(
          4,
          new decimal(4),
          new decimal(4),
          new decimal(4),
          new decimal(4),
          new decimal(4)
        ),
        new Candle(
          5,
          new decimal(5),
          new decimal(5),
          new decimal(5),
          new decimal(5),
          new decimal(5)
        ),
        new Candle(
          6,
          new decimal(6),
          new decimal(6),
          new decimal(6),
          new decimal(6),
          new decimal(6)
        ),
        new Candle(
          7,
          new decimal(7),
          new decimal(7),
          new decimal(7),
          new decimal(7),
          new decimal(7)
        ),
        new Candle(
          8,
          new decimal(8),
          new decimal(8),
          new decimal(8),
          new decimal(8),
          new decimal(8)
        )
      ])
      .then(() => {
        streamer.subscribe(instrument);
        streamer.tryContinue();
      });
  });
});
