import { d } from '../shared';
import { Asset } from './asset';
import { Commission } from './commission';
import { Instrument } from './instrument';
import { Orderbook } from './orderbook';

describe('Orderbook', () => {
  const instrument = new Instrument(
    0,
    new Asset('abc', 'xyz', 4),
    new Asset('def', 'xyz', 4),
    'abc-def',
    Commission.Zero
  );

  test('should construct an empty orderbook', () => {
    const sut = new Orderbook(
      0,
      instrument,
      { rate: d(2), quantity: d(1), next: undefined },
      { rate: d(1), quantity: d(1), next: undefined }
    );

    expect(sut.id).toEqual(instrument.id);
  });
});
