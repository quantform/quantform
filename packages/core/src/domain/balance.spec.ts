import { d } from '../shared';
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

    expect(sut.asset.id).toEqual('xyz:abc');
    expect(sut.free).toEqual(d(0));
    expect(sut.locked).toEqual(d(0));
    expect(Object.keys(sut.position).length).toEqual(0);
  });

  test('should construct balance', () => {
    const sut = new Balance(asset);

    sut.set(d(100), d(50));

    expect(sut.asset.id).toEqual('xyz:abc');
    expect(sut.free).toEqual(d(100));
    expect(sut.locked).toEqual(d(50));
    expect(sut.total).toEqual(d(150));
    expect(Object.keys(sut.position).length).toEqual(0);
  });

  test('should account positive amount', () => {
    const sut = new Balance(asset);

    sut.set(d(100), d(0));
    sut.account(d(10));

    expect(sut.free).toEqual(d(110));
    expect(sut.locked).toEqual(d(0));
    expect(sut.total).toEqual(d(110));
  });

  test('should account negative amount', () => {
    const sut = new Balance(asset);

    sut.set(d(100), d(0));
    sut.account(d(-10));

    expect(sut.free).toEqual(d(90));
    expect(sut.locked).toEqual(d(0));
    expect(sut.total).toEqual(d(90));
  });

  test('should throw for insufficient balance account amount', () => {
    const sut = new Balance(asset);

    sut.set(d(100), d(0));
    const fn = () => sut.account(d(-120));

    expect(fn).toThrowError();
  });

  test('should lock specific amount of available balance', () => {
    const sut = new Balance(asset);

    sut.set(d(100), d(0));
    sut.lock('key', d(10));

    expect(sut.free).toEqual(d(90));
    expect(sut.locked).toEqual(d(10));
    expect(sut.total).toEqual(d(100));
  });

  test('should throw for lock insufficient amount of available balance', () => {
    const sut = new Balance(asset);

    sut.set(d(30), d(50));
    const fn = () => sut.lock('key', d(100));

    expect(fn).toThrowError();
  });

  test('should lock an unlock specific amount of available balance', () => {
    const sut = new Balance(asset);

    sut.set(d(100), d(0));
    sut.lock('key', d(40));
    sut.tryUnlock('key');

    expect(sut.free).toEqual(d(100));
    expect(sut.locked).toEqual(d(0));
    expect(sut.total).toEqual(d(100));
  });

  test('should return correct estimated unrealized pnl', () => {
    const position = new Position('1', instrument, 'CROSS', d(2511.81), d(10.31), 20);

    position.calculateEstimatedUnrealizedPnL(d(2576.44));

    const sut = new Balance(asset);

    sut.set(d(100), d(0));
    sut.position['1'] = position;

    expect(sut.getEstimatedUnrealizedPnL()).toEqual(d(0.2652));
    expect(sut.free).toEqual(d(100).add(d(0.2652)));
    expect(sut.total).toEqual(d(100).add(d(0.2652)));
  });
});
