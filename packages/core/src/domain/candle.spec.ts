import { d, now } from '../shared';
import { Candle } from './candle';

describe('Candle', () => {
  test('should construct a candle', () => {
    const timestamp = now();

    const sut = new Candle(timestamp, d(2), d(4), d(1), d(3));

    expect(sut.timestamp).toEqual(timestamp);
    expect(sut.open).toEqual(d(2));
    expect(sut.high).toEqual(d(4));
    expect(sut.low).toEqual(d(1));
    expect(sut.close).toEqual(d(3));
  });

  test('should modify a candle', () => {
    const timestamp = now();

    const sut = new Candle(timestamp, d(2), d(4), d(1), d(3));

    sut.apply(d(10));

    expect(sut.timestamp).toEqual(timestamp);
    expect(sut.open).toEqual(d(2));
    expect(sut.high).toEqual(d(10));
    expect(sut.low).toEqual(d(1));
    expect(sut.close).toEqual(d(10));
  });
});
