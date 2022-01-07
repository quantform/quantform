import { Store } from '../../store';
import { Asset, Instrument, Timeframe } from '../../domain';
import { Feed, InMemoryStorage } from '../../storage';
import { CandleEvent } from '../../store/event';
import { BacktesterStreamer } from './backtester-streamer';
import { Worker } from '../../shared';

const instrument = new Instrument(
  new Asset('btc', 'binance', 8),
  new Asset('usdt', 'binance', 2),
  'binance:btc-usdt'
);

describe('backtester streamer tests', () => {
  test('should repeat specific events', done => {
    const feed = new Feed(new InMemoryStorage());
    const store = new Store();

    store.snapshot.universe.instrument[instrument.toString()] = instrument;
    store.snapshot.subscription.instrument[instrument.toString()] = instrument;

    const streamer = new BacktesterStreamer(
      new Worker(),
      store,
      feed,
      {
        balance: {},
        from: 0,
        to: 10
      },
      {
        onBacktestCompleted: () => {
          const trade = store.snapshot.trade[instrument.toString()];

          expect(trade.timestamp).toEqual(8);
          expect(trade.rate).toEqual(8);
          expect(trade.quantity).toEqual(8);
          expect(store.snapshot.timestamp).toEqual(8);

          done();
        }
      }
    );

    feed
      .save(instrument, [
        new CandleEvent(instrument, Timeframe.M1, 1, 1, 1, 1, 1, 1),
        new CandleEvent(instrument, Timeframe.M1, 2, 2, 2, 2, 2, 2),
        new CandleEvent(instrument, Timeframe.M1, 3, 3, 3, 3, 3, 3),
        new CandleEvent(instrument, Timeframe.M1, 4, 4, 4, 4, 4, 4),
        new CandleEvent(instrument, Timeframe.M1, 5, 5, 5, 5, 5, 5),
        new CandleEvent(instrument, Timeframe.M1, 6, 6, 6, 6, 6, 6),
        new CandleEvent(instrument, Timeframe.M1, 7, 7, 7, 7, 7, 7),
        new CandleEvent(instrument, Timeframe.M1, 8, 8, 8, 8, 8, 8)
      ])
      .then(() => {
        streamer.subscribe(instrument);
        streamer.tryContinue();
      });
  });
});
