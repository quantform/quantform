import { Asset, Commission, Instrument, Orderbook } from '@lib/component';
import { d } from '@lib/shared';

describe(Orderbook.name, () => {
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
