import { Asset } from './asset';
import { Balance } from './balance';
import { Instrument } from './instrument';
import { Position } from './position';

describe('Balance', () => {
  const asset = new Asset('abc', 'xyz', 4);
  const instrument = new Instrument(
    new Asset('abc', 'xyz', 4),
    new Asset('def', 'xyz', 4),
    'abc-def'
  );

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

  test('should return corrent estimated unrealized pnl', () => {
    const position = new Position('1', instrument, 'CROSS', 2511.81, 10.31, 20);

    position.calculateEstimatedUnrealizedPnL(2576.44);

    const sut = new Balance(asset);

    sut.set(100, 0);
    sut.position['1'] = position;

    expect(sut.getEstimatedUnrealizedPnL()).toEqual(0.2652);
    expect(sut.free).toEqual(100 + 0.2652);
    expect(sut.total).toEqual(100 + 0.2652);
  });
});
