import { Asset } from './asset';
import { Balance } from './balance';

describe('Balance', () => {
  const asset = new Asset('abc', 'xyz', 4);

  test('should construct empty balance', () => {
    const sut = new Balance(asset);

    expect(sut.asset.toString()).toEqual('xyz:abc');
    expect(sut.free).toEqual(0);
    expect(sut.locked).toEqual(0);
    expect(Object.keys(sut.position).length).toEqual(0);
  });

  test('should construct balance', () => {
    const sut = new Balance(asset);

    sut.set(100, 50);

    expect(sut.asset.toString()).toEqual('xyz:abc');
    expect(sut.free).toEqual(100);
    expect(sut.locked).toEqual(50);
    expect(sut.total).toEqual(150);
    expect(Object.keys(sut.position).length).toEqual(0);
  });

  test('should account positive amount', () => {
    const sut = new Balance(asset);

    sut.set(100, 0);
    sut.account(10);

    expect(sut.free).toEqual(110);
    expect(sut.locked).toEqual(0);
    expect(sut.total).toEqual(110);
  });

  test('should account negative amount', () => {
    const sut = new Balance(asset);

    sut.set(100, 0);
    sut.account(-10);

    expect(sut.free).toEqual(90);
    expect(sut.locked).toEqual(0);
    expect(sut.total).toEqual(90);
  });

  test('should throw for insufficient balance account amount', () => {
    const sut = new Balance(asset);

    sut.set(100, 0);
    const fn = () => sut.account(-120);

    expect(fn).toThrowError();
  });

  test('should lock specific amount of available balance', () => {
    const sut = new Balance(asset);

    sut.set(100, 0);
    sut.lock(10);

    expect(sut.free).toEqual(90);
    expect(sut.locked).toEqual(10);
    expect(sut.total).toEqual(100);
  });

  test('should throw for lock insufficient amount of available balance', () => {
    const sut = new Balance(asset);

    sut.set(30, 50);
    const fn = () => sut.lock(100);

    expect(fn).toThrowError();
  });

  test('should unlock specific amount of available balance', () => {
    const sut = new Balance(asset);

    sut.set(100, 60);
    sut.unlock(10);

    expect(sut.free).toEqual(110);
    expect(sut.locked).toEqual(50);
    expect(sut.total).toEqual(160);
  });

  test('should throw for unlock insufficient amount of available balance', () => {
    const sut = new Balance(asset);

    sut.set(0, 50);
    const fn = () => sut.unlock(100);

    expect(fn).toThrowError();
  });

  test('should lock an unlock specific amount of available balance', () => {
    const sut = new Balance(asset);

    sut.set(100, 0);
    sut.lock(40);
    sut.unlock(40);

    expect(sut.free).toEqual(100);
    expect(sut.locked).toEqual(0);
    expect(sut.total).toEqual(100);
  });
});
