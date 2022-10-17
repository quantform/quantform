import { d } from '../shared';
import { Asset } from './asset';
import { Commission } from './commission';
import { Instrument } from './instrument';
import { Position } from './position';

describe('Position', () => {
  const instrument = new Instrument(
    0,
    new Asset('abc', 'xyz', 4),
    new Asset('def', 'xyz', 4),
    'abc-def',
    Commission.Zero
  );

  test('should construct a position', () => {
    const sut = new Position(0, '1', instrument, 'CROSS', d(10), d(2), 3);

    expect(sut.id).toEqual('1');
    expect(sut.mode).toEqual('CROSS');
    expect(sut.averageExecutionRate).toEqual(d(10));
    expect(sut.size).toEqual(d(2));
    expect(sut.leverage).toEqual(3);
    expect(sut.estimatedUnrealizedPnL).toEqual(undefined);
    expect(sut.id).toEqual('1');
  });

  test('should calculate correct margin', () => {
    const sut = new Position(0, '1', instrument, 'CROSS', d(2511.81), d(10.31), 20);

    expect(sut.margin).toEqual(d(0.5155));
    expect(sut.estimatedUnrealizedPnL).toEqual(undefined);
  });

  test('should calculate correct unrealized pnl', () => {
    const sut = new Position(0, '1', instrument, 'CROSS', d(2511.81), d(10.31), 20);

    const pnl = sut.calculateEstimatedUnrealizedPnL(d(2576.44));

    expect(pnl).toEqual(d(0.2652));
    expect(sut.estimatedUnrealizedPnL).toEqual(d(0.2652));
  });
});
