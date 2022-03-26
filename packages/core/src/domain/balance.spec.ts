import { Asset } from './asset';
import { Balance } from './balance';

describe('balance tests', () => {
  test('should instantiate empty balance', () => {
    const sut = new Balance(new Asset('abc', 'xyz', 4));

    expect(sut.asset.toString()).toEqual('xyz:abc');
    expect(sut.free).toEqual(0);
    expect(sut.locked).toEqual(0);
    expect(Object.keys(sut.position).length).toEqual(0);
  });

  test('should instantiate balance', () => {
    const sut = new Balance(new Asset('abc', 'xyz', 4));

    sut.set(100, 50);

    expect(sut.asset.toString()).toEqual('xyz:abc');
    expect(sut.free).toEqual(100);
    expect(sut.locked).toEqual(50);
    expect(Object.keys(sut.position).length).toEqual(0);
  });
});
