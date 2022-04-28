import { now } from '../shared';
import { Candle } from './candle';

describe('Candle', () => {
  test('should construct a candle', () => {
    const timestamp = now();

    const sut = new Candle(timestamp, 2, 4, 1, 3);

    expect(sut.timestamp).toEqual(timestamp);
    expect(sut.open).toEqual(2);
    expect(sut.high).toEqual(4);
    expect(sut.low).toEqual(1);
    expect(sut.close).toEqual(3);
  });

  test('should modify a candle', () => {
    const timestamp = now();

    const sut = new Candle(timestamp, 2, 4, 1, 3);
    sut.apply(10);

    expect(sut.timestamp).toEqual(timestamp);
    expect(sut.open).toEqual(2);
    expect(sut.high).toEqual(10);
    expect(sut.low).toEqual(1);
    expect(sut.close).toEqual(10);
  });
});
