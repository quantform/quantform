import { Asset, assetOf } from './asset';

describe('asset tests', () => {
  test('should instantiate proper asset', () => {
    const sut = new Asset('abc', 'xyz', 4);

    expect(sut.name).toEqual('abc');
    expect(sut.adapter).toEqual('xyz');
    expect(sut.scale).toEqual(4);
    expect(sut.tickSize).toEqual(0.0001);
    expect(sut.fixed(1.1234567)).toEqual(1.1234);
    expect(sut.floor(1.1234567)).toEqual(1.1234);
    expect(sut.ceil(1.1234567)).toEqual(1.1235);
    expect(sut.toString()).toEqual('xyz:abc');
  });
});

describe('asset selector tests', () => {
  test('should instantiate proper asset selector', () => {
    const sut = assetOf('xyz:abc');

    expect(sut.name).toEqual('abc');
    expect(sut.adapter).toEqual('xyz');
    expect(sut.toString()).toEqual('xyz:abc');
  });

  test('should instantiate proper asset selector capital case', () => {
    const sut = assetOf('XYZ:ABC');

    expect(sut.name).toEqual('abc');
    expect(sut.adapter).toEqual('xyz');
    expect(sut.toString()).toEqual('xyz:abc');
  });

  test('should throw invalid format message for missing separator', () => {
    const fn = () => {
      assetOf('xyzabc');
    };

    expect(fn).toThrow(Error);
  });

  test('should throw invalid format message for multiple separators', () => {
    const fn = () => {
      assetOf('xyz:abc:');
    };

    expect(fn).toThrow(Error);
  });

  test('should throw invalid format message for missing asset name', () => {
    const fn = () => {
      assetOf('xyz:');
    };

    expect(fn).toThrow(Error);
  });

  test('should throw invalid format message for missing adapter name', () => {
    const fn = () => {
      assetOf(':abc');
    };

    expect(fn).toThrow(Error);
  });
});
