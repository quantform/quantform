import { decimal } from '../shared';
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
    const sut = Order.market(instrument, new decimal(100));

    expect(sut.quantity).toEqual(new decimal(100));
    expect(sut.rate).toEqual(undefined);
    expect(sut.type).toEqual('MARKET');
  });

  test('should construct a market sell order', () => {
    const sut = Order.market(instrument, new decimal(-100));

    expect(sut.quantity).toEqual(new decimal(-100));
    expect(sut.rate).toEqual(undefined);
    expect(sut.type).toEqual('MARKET');
  });

  test('should construct a limit buy order', () => {
    const sut = Order.limit(instrument, new decimal(100), new decimal(2000));

    expect(sut.quantity).toEqual(new decimal(100));
    expect(sut.rate).toEqual(new decimal(2000));
    expect(sut.type).toEqual('LIMIT');
  });

  test('should construct a limit sell order', () => {
    const sut = Order.limit(instrument, new decimal(-100), new decimal(2000));

    expect(sut.quantity).toEqual(new decimal(-100));
    expect(sut.rate).toEqual(new decimal(2000));
    expect(sut.type).toEqual('LIMIT');
  });
});
