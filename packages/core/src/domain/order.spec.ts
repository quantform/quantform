import { d } from '../shared';
import { Asset } from './asset';
import { Instrument } from './instrument';
import { Order } from './order';

describe('Order', () => {
  const instrument = new Instrument(
    new Asset('abc', 'xyz', 4),
    new Asset('def', 'xyz', 4),
    'abc-def'
  );

  test('should construct a market buy order', () => {
    const sut = Order.market(instrument, d(100));

    expect(sut.quantity).toEqual(d(100));
    expect(sut.rate).toEqual(undefined);
    expect(sut.type).toEqual('MARKET');
  });

  test('should construct a market sell order', () => {
    const sut = Order.market(instrument, d(-100));

    expect(sut.quantity).toEqual(d(-100));
    expect(sut.rate).toEqual(undefined);
    expect(sut.type).toEqual('MARKET');
  });

  test('should construct a limit buy order', () => {
    const sut = Order.limit(instrument, d(100), d(2000));

    expect(sut.quantity).toEqual(d(100));
    expect(sut.rate).toEqual(d(2000));
    expect(sut.type).toEqual('LIMIT');
  });

  test('should construct a limit sell order', () => {
    const sut = Order.limit(instrument, d(-100), d(2000));

    expect(sut.quantity).toEqual(d(-100));
    expect(sut.rate).toEqual(d(2000));
    expect(sut.type).toEqual('LIMIT');
  });
});
