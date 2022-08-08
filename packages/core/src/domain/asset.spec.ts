import { decimal } from '../shared';
import { Asset, assetOf } from './asset';

describe('Asset', () => {
  test('should construct a new asset', () => {
    const sut = new Asset('abc', 'xyz', 4);

    expect(sut.name).toEqual('abc');
    expect(sut.adapterName).toEqual('xyz');
    expect(sut.scale).toEqual(4);
    expect(sut.tickSize).toEqual(new decimal(0.0001));
    expect(sut.floor(new decimal(1.1234567))).toEqual(new decimal(1.1234));
    expect(sut.ceil(new decimal(1.1234567))).toEqual(new decimal(1.1235));
    expect(sut.id).toEqual('xyz:abc');
  });

  test('should throw for missing asset name', () => {
    const fn = () => new Asset('xyz', '', 5);

    expect(fn).toThrowError();
  });

  test('should throw for missing adapter name', () => {
    const fn = () => new Asset('', 'xyz', 5);

    expect(fn).toThrowError();
  });
});

describe('AssetSelector', () => {
  test('should construct a new asset selector from unified string', () => {
    const sut = assetOf('xyz:abc');

    expect(sut.name).toEqual('abc');
    expect(sut.adapterName).toEqual('xyz');
    expect(sut.id).toEqual('xyz:abc');
  });

  test('should instantiate proper asset selector capital case', () => {
    const sut = assetOf('XYZ:ABC');

    expect(sut.name).toEqual('abc');
    expect(sut.adapterName).toEqual('xyz');
    expect(sut.id).toEqual('xyz:abc');
  });

  test('should throw invalid format message for missing separator', () => {
    const fn = () => assetOf('xyzabc');

    expect(fn).toThrowError();
  });

  test('should throw for multiple separators', () => {
    const fn = () => assetOf('xyz:abc:');

    expect(fn).toThrowError();
  });

  test('should throw for missing asset name', () => {
    const fn = () => assetOf('xyz:');

    expect(fn).toThrowError();
  });

  test('should throw for missing adapter name', () => {
    const fn = () => assetOf(':abc');

    expect(fn).toThrowError();
  });
});
