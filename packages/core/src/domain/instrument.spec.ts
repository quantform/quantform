import { Asset, assetOf } from './asset';
import { Instrument, instrumentOf } from './instrument';

describe('Instrument', () => {
  test('should construct a instrument', () => {
    const sut = new Instrument(
      new Asset('abc', 'xyz', 4),
      new Asset('def', 'xyz', 4),
      'abc-def'
    );

    expect(sut.base.name).toEqual('abc');
    expect(sut.base.adapterName).toEqual('xyz');
    expect(sut.quote.name).toEqual('def');
    expect(sut.quote.adapterName).toEqual('xyz');
    expect(sut.id).toEqual('xyz:abc-def');
  });
});

describe('InstrumentSelector', () => {
  test('should construct a instrument selector', () => {
    const sut = instrumentOf('xyz:abc-def');

    expect(sut.base.name).toEqual('abc');
    expect(sut.base.adapterName).toEqual('xyz');
    expect(sut.quote.name).toEqual('def');
    expect(sut.quote.adapterName).toEqual('xyz');
    expect(sut.id).toEqual('xyz:abc-def');
  });

  test('should construct a instrument selector capital case', () => {
    const sut = instrumentOf('XYZ:ABC-DEF');

    expect(sut.base.name).toEqual('abc');
    expect(sut.base.adapterName).toEqual('xyz');
    expect(sut.quote.name).toEqual('def');
    expect(sut.quote.adapterName).toEqual('xyz');
    expect(sut.id).toEqual('xyz:abc-def');
  });

  test('should throw invalid format message for missing separator', () => {
    const fn = () => instrumentOf('xyzabc-def');

    expect(fn).toThrowError();
  });

  test('should throw invalid format message for multiple separators', () => {
    const fn = () => instrumentOf('xyz:abc:-def');

    expect(fn).toThrowError();
  });

  test('should throw invalid format message for missing pair name', () => {
    const fn = () => instrumentOf('xyz:');

    expect(fn).toThrowError();
  });

  test('should throw invalid format message for missing adapter name', () => {
    const fn = () => assetOf(':abc-def');

    expect(fn).toThrowError();
  });
});
