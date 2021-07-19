import { Asset, assetOf } from './asset';
import { Instrument, instrumentOf } from './instrument';

describe('instrument tests', () => {
  test('should instantiate proper instrument', () => {
    const sut = new Instrument(
      new Asset('abc', 'xyz', 4),
      new Asset('def', 'xyz', 4),
      'abc-def'
    );

    expect(sut.base.name).toEqual('abc');
    expect(sut.base.exchange).toEqual('xyz');
    expect(sut.quote.name).toEqual('def');
    expect(sut.quote.exchange).toEqual('xyz');
    expect(sut.toString()).toEqual('xyz:abc-def');
  });
});

describe('instrument selector tests', () => {
  test('should instantiate proper instrument selector', () => {
    const sut = instrumentOf('xyz:abc-def');

    expect(sut.base.name).toEqual('abc');
    expect(sut.base.exchange).toEqual('xyz');
    expect(sut.quote.name).toEqual('def');
    expect(sut.quote.exchange).toEqual('xyz');
    expect(sut.toString()).toEqual('xyz:abc-def');
  });

  test('should instantiate proper instrument selector capital case', () => {
    const sut = instrumentOf('XYZ:ABC-DEF');

    expect(sut.base.name).toEqual('abc');
    expect(sut.base.exchange).toEqual('xyz');
    expect(sut.quote.name).toEqual('def');
    expect(sut.quote.exchange).toEqual('xyz');
    expect(sut.toString()).toEqual('xyz:abc-def');
  });

  test('should throw invalid format message for missing separator', () => {
    const fn = () => {
      instrumentOf('xyzabc-def');
    };

    expect(fn).toThrow(Error);
  });

  test('should throw invalid format message for multiple separators', () => {
    const fn = () => {
      instrumentOf('xyz:abc:-def');
    };

    expect(fn).toThrow(Error);
  });

  test('should throw invalid format message for missing pair name', () => {
    const fn = () => {
      instrumentOf('xyz:');
    };

    expect(fn).toThrow(Error);
  });

  test('should throw invalid format message for missing exchange name', () => {
    const fn = () => {
      assetOf(':abc-def');
    };

    expect(fn).toThrow(Error);
  });
});
