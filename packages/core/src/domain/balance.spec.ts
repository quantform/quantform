import { d } from '../shared';
import { Asset } from './asset';
import { Balance } from './balance';
import { Commission } from './commission';
import { Instrument } from './instrument';
import { Order } from './order';
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
    expect(Object.keys(sut.order).length).toEqual(0);
    expect(Object.keys(sut.position).length).toEqual(0);
  });

  test('should lock all amount of available balance for buy order', () => {
    const sut = new Balance(0, asset, d(100));

    sut.updateByOrder(new Order(0, '1', instrument, d(10), 0));

    expect(sut.free).toEqual(d.Zero);
    expect(sut.locked).toEqual(d(100));
    expect(sut.total).toEqual(d(100));
  });

  test('should lock amount of available balance for sell order', () => {
    const sut = new Balance(0, asset, d(100));

    sut.updateByOrder(new Order(0, '1', instrument, d(-10), 0));

    expect(sut.free).toEqual(d(90));
    expect(sut.locked).toEqual(d(10));
    expect(sut.total).toEqual(d(100));
  });

  test('should not throw for lock insufficient amount of available balance', () => {
    const sut = new Balance(0, asset, d(30));

    const fn = () => sut.updateByOrder(new Order(0, '1', instrument, d(50), 0));

    expect(fn).not.toThrowError();
  });

  test('should lock and unlock specific amount of available balance', () => {
    const sut = new Balance(0, asset, d(100));
    const order = new Order(0, '1', instrument, d(40), 0);

    sut.updateByOrder(order);

    order.state = 'FILLED';

    sut.updateByOrder(order);

    expect(sut.free).toEqual(d(100));
    expect(sut.locked).toEqual(d.Zero);
    expect(sut.total).toEqual(d(100));
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
