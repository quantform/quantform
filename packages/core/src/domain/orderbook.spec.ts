import { Asset } from './asset';
import { Instrument } from './instrument';
import { Orderbook } from './orderbook';

describe('Orderbook', () => {
  const instrument = new Instrument(
    new Asset('abc', 'xyz', 4),
    new Asset('def', 'xyz', 4),
    'abc-def'
  );

  test('should construct an empty orderbook', () => {
    const sut = new Orderbook(instrument);

    expect(sut.toString()).toEqual(instrument.toString());
  });
});
