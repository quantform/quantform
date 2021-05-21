import { ExchangeBinanceAdapter } from '../exchange-binance';
import { SessionDescriptor, SessionFactory } from '../session';
import { assetOf, instrumentOf, Timeframe } from '../domain';
import { finalize, tap } from 'rxjs/operators';

describe('session paper tests', () => {
  const descriptor: SessionDescriptor = {
    awake: () => Promise.resolve(),
    dispose: () => Promise.resolve(),
    measurement: null,
    adapter: () => [new ExchangeBinanceAdapter()],
    options: () => ({
      from: 0,
      to: 0,
      feed: null,
      balance: {
        ['binance:btc']: 1.23
      }
    })
  };

  test('should pipe balance reply on subscription', async done => {
    const session = SessionFactory.paper(descriptor);
    await session.initialize();

    session.balance(assetOf('binance:btc')).subscribe({
      next: it => {
        expect(it.free).toEqual(1.23);
        done();
      }
    });
  });

  test('should pipe history', async done => {
    const session = SessionFactory.paper(descriptor);
    await session.initialize();

    session
      .history(instrumentOf('binance:btc-usdt'), Timeframe.D1, 5)
      .pipe(finalize(() => done()))
      .subscribe();
  });

  test('should pipe orders', async done => {
    const session = SessionFactory.paper(descriptor);
    await session.initialize();

    session
      .orders(instrumentOf('binance:btc-usdt'))
      .pipe(
        tap(pending => {
          expect(pending.length).toBe(0);
          done();
        })
      )
      .subscribe();
  });
});
/*
describe('session backtest integration tests', () => {
  test('should pipe trade execustions', async done => {
    const instrument = instrumentOf('binance:btc-usdt');
    const feed = new InMemoryFeed();
    const session = SessionFactory.backtest([new ExchangeBinanceAdapter()], {
      feed: feed,
      from: 0,
      to: 100,
      balance: {}
    });

    await feed.write(instrument, [
      new TradePatchEvent(instrument, 1, 1, 1),
      new TradePatchEvent(instrument, 2, 1, 2),
      new TradePatchEvent(instrument, 3, 1, 3)
    ]);

    session
      .trade(instrument)
      .pipe(
        take(1),
        map(it => {
          expect(it.rate).toEqual(1);
          done();
        })
      )
      .subscribe();

    await session.initialize();
  });

  test('should wait for latest history when trade executed', async done => {
    const instrument = instrumentOf('binance:btc-usdt');
    const feed = new InMemoryFeed();
    const timestamp = now();
    const session = SessionFactory.backtest([new ExchangeBinanceAdapter()], {
      feed: feed,
      from: timestamp,
      to: timestamp + 100,
      balance: {}
    });

    await feed.write(instrument, [
      new TradePatchEvent(instrument, 1, 1, timestamp + 1),
      new TradePatchEvent(instrument, 2, 1, timestamp + 2),
      new TradePatchEvent(instrument, 3, 1, timestamp + 3)
    ]);

    session
      .trade(instrument)
      .pipe(
        take(1),
        withLatestFrom(session.history(instrument, Timeframe.D1, 3)),
        map(([trade, history]) => {
          expect(history.close).toBeGreaterThan(0);
          expect(trade.rate).toEqual(1);
          done();
        })
      )
      .subscribe();

    await session.initialize();
  });
});
*/
