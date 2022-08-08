import { decimal, now } from '../shared';
import { Candle } from './candle';

describe('Candle', () => {
  test('should construct a candle', () => {
    const timestamp = now();

    const sut = new Candle(
      timestamp,
      new decimal(2),
      new decimal(4),
      new decimal(1),
      new decimal(3)
    );

    expect(sut.timestamp).toEqual(timestamp);
    expect(sut.open).toEqual(new decimal(2));
    expect(sut.high).toEqual(new decimal(4));
    expect(sut.low).toEqual(new decimal(1));
    expect(sut.close).toEqual(new decimal(3));
  });

  test('should modify a candle', () => {
    const timestamp = now();

    const sut = new Candle(
      timestamp,
      new decimal(2),
      new decimal(4),
      new decimal(1),
      new decimal(3)
    );

    sut.apply(new decimal(10));

    expect(sut.timestamp).toEqual(timestamp);
    expect(sut.open).toEqual(new decimal(2));
    expect(sut.high).toEqual(new decimal(10));
    expect(sut.low).toEqual(new decimal(1));
    expect(sut.close).toEqual(new decimal(10));
  });
});
