import { d } from '../shared';
import { Asset } from './asset';
import { Commission } from './commission';
import { Instrument } from './instrument';
import { Order } from './order';

describe('Order', () => {
  const instrument = new Instrument(
    0,
    new Asset('abc', 'xyz', 4),
    new Asset('def', 'xyz', 4),
    'abc-def',
    Commission.Zero
  );

  test('should construct a market buy order', () => {
    const sut = new Order(0, '1', instrument, d(100), 0);

    expect(sut.quantity).toEqual(d(100));
    expect(sut.rate).toEqual(undefined);
  });

  test('should construct a market sell order', () => {
    const sut = new Order(0, '1', instrument, d(-100), 0);

    expect(sut.quantity).toEqual(d(-100));
    expect(sut.rate).toEqual(undefined);
  });

  test('should construct a limit buy order', () => {
    const sut = new Order(0, '1', instrument, d(100), 0, d(2000));

    expect(sut.quantity).toEqual(d(100));
    expect(sut.rate).toEqual(d(2000));
  });

  test('should construct a limit sell order', () => {
    const sut = new Order(0, '1', instrument, d(-100), 0, d(2000));

    expect(sut.quantity).toEqual(d(-100));
    expect(sut.rate).toEqual(d(2000));
  });
});
