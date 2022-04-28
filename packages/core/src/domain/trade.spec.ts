import { Asset } from './asset';
import { Instrument } from './instrument';
import { Trade } from './trade';

describe('Trade', () => {
  const instrument = new Instrument(
    new Asset('abc', 'xyz', 4),
    new Asset('def', 'xyz', 4),
    'abc-def'
  );

  test('should construct an empty trade', () => {
    const sut = new Trade(instrument);

    expect(sut.toString()).toEqual(instrument.toString());
  });
});
