import { d } from '../shared';
import { Asset } from './asset';
import { Balance } from './balance';
import { Commission } from './commission';
import { Instrument } from './instrument';
import { Position } from './position';

describe('Balance', () => {
  const asset = new Asset('abc', 'xyz', 4);
  const instrument = new Instrument(
    0,
    new Asset('abc', 'xyz', 4),
    new Asset('def', 'xyz', 4),
    'abc-def',
    Commission.Zero
  );

  test('should construct empty balance', () => {
    const sut = new Balance(0, asset);

    expect(sut.asset.id).toEqual('xyz:abc');
    expect(sut.free).toEqual(d.Zero);
    expect(sut.locked).toEqual(d.Zero);
    expect(Object.keys(sut.position).length).toEqual(0);
  });

  test('should construct balance', () => {
    const sut = new Balance(1, asset, d(100));

    expect(sut.asset.id).toEqual('xyz:abc');
    expect(sut.free).toEqual(d(100));
    expect(sut.locked).toEqual(d(0));
    expect(sut.total).toEqual(d(100));
    expect(Object.keys(sut.position).length).toEqual(0);
  });

  test('should return correct estimated unrealized pnl', () => {
    const position = new Position(0, '1', instrument, 'CROSS', d(2511.81), d(10.31), 20);

    position.calculateEstimatedUnrealizedPnL(d(2576.44));

    const sut = new Balance(0, asset, d(100));

    sut.position['1'] = position;

    expect(sut.getEstimatedUnrealizedPnL()).toEqual(d(0.2652));
    expect(sut.free).toEqual(d(100).add(d(0.2652)));
    expect(sut.total).toEqual(d(100).add(d(0.2652)));
  });
});
