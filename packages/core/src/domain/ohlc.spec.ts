import { Ohlc } from '@lib/domain';
import { d, now } from '@lib/shared';

describe('Ohlc', () => {
  test('should construct a ohlc', () => {
    const timestamp = now();

    const sut = new Ohlc(timestamp, d(2), d(4), d(1), d(3));

    expect(sut.timestamp).toEqual(timestamp);
    expect(sut.open).toEqual(d(2));
    expect(sut.high).toEqual(d(4));
    expect(sut.low).toEqual(d(1));
    expect(sut.close).toEqual(d(3));
  });

  test('should modify a ohlc', () => {
    const timestamp = now();

    const sut = new Ohlc(timestamp, d(2), d(4), d(1), d(3));

    sut.apply(d(10));

    expect(sut.timestamp).toEqual(timestamp);
    expect(sut.open).toEqual(d(2));
    expect(sut.high).toEqual(d(10));
    expect(sut.low).toEqual(d(1));
    expect(sut.close).toEqual(d(10));
  });
});
