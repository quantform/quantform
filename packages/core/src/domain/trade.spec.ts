import { Asset, Commission, Instrument, Trade } from '@lib/domain';
import { d } from '@lib/shared';

describe(Trade.name, () => {
  const instrument = new Instrument(
    0,
    new Asset('abc', 'xyz', 4),
    new Asset('def', 'xyz', 4),
    'abc-def',
    Commission.Zero
  );

  test('should construct an empty trade', () => {
    const sut = new Trade(0, instrument, d.Zero, d.Zero);

    expect(sut.id).toEqual(instrument.id);
  });
});
