import { from } from 'rxjs';
import { map } from 'rxjs/operators';
import { TradePatchEvent } from '../store/event';
import { now } from '../common';
import { Candle } from './candle';
import { candleWithHistory } from './candle-builder';
import { instrumentOf } from './instrument';
import { Timeframe } from './timeframe';

describe('candle tests', () => {
  test('should instantiate proper candle', () => {
    const timestamp = now();

    const sut = new Candle(timestamp, 2, 4, 1, 3);

    expect(sut.timestamp).toEqual(timestamp);
    expect(sut.open).toEqual(2);
    expect(sut.high).toEqual(4);
    expect(sut.low).toEqual(1);
    expect(sut.close).toEqual(3);
  });

  test('should pipe and merge candle from history', done => {
    const timestamp = 0;
    const instrument = instrumentOf('binance:btc-usdt');

    const history$ = from([
      new Candle(timestamp + Timeframe.D1 * 1, 1, 1.5, 0.5, 2),
      new Candle(timestamp + Timeframe.D1 * 2, 2, 2.5, 1.5, 3),
      new Candle(timestamp + Timeframe.D1 * 3, 3, 3.5, 2.5, 4)
    ]);

    const input$ = from([
      new TradePatchEvent(instrument, 5, 1, timestamp + Timeframe.D1 * 3),
      new TradePatchEvent(instrument, 3, 1, timestamp + Timeframe.D1 * 4),
      new TradePatchEvent(instrument, 4, 1, timestamp + Timeframe.D1 * 5)
    ]);

    const high = [1.5, 2.5, 5, 3];

    input$
      .pipe(candleWithHistory(Timeframe.D1, it => it.rate, history$))
      .pipe(
        map(it => {
          expect(it.high).toBe(high.shift());

          if (!high.length) {
            done();
          }
        })
      )
      .subscribe();
  });

  test('should pipe and not merge candle from history', done => {
    const timestamp = 0;
    const instrument = instrumentOf('binance:btc-usdt');

    const history$ = from([
      new Candle(timestamp + Timeframe.D1 * 1, 1, 1.5, 0.5, 2),
      new Candle(timestamp + Timeframe.D1 * 2, 2, 2.5, 1.5, 3),
      new Candle(timestamp + Timeframe.D1 * 3, 3, 3.5, 2.5, 4)
    ]);

    const input$ = from([
      new TradePatchEvent(instrument, 5, 1, timestamp + Timeframe.D1 * 4),
      new TradePatchEvent(instrument, 3, 1, timestamp + Timeframe.D1 * 5),
      new TradePatchEvent(instrument, 4, 1, timestamp + Timeframe.D1 * 6)
    ]);

    const high = [1.5, 2.5, 3.5, 5, 3];

    input$
      .pipe(candleWithHistory(Timeframe.D1, it => it.rate, history$))
      .pipe(
        map(it => {
          expect(it.high).toBe(high.shift());

          if (!high.length) {
            done();
          }
        })
      )
      .subscribe();
  });
});
