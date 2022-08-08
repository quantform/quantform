import { decimal } from '../shared';
import { Asset } from './asset';
import { Instrument } from './instrument';
import { Position } from './position';

describe('Position', () => {
  const instrument = new Instrument(
    new Asset('abc', 'xyz', 4),
    new Asset('def', 'xyz', 4),
    'abc-def'
  );

  test('should construct a position', () => {
    const sut = new Position(
      '1',
      instrument,
      'CROSS',
      new decimal(10),
      new decimal(2),
      3
    );

    expect(sut.id).toEqual('1');
    expect(sut.mode).toEqual('CROSS');
    expect(sut.averageExecutionRate).toEqual(new decimal(10));
    expect(sut.size).toEqual(new decimal(2));
    expect(sut.leverage).toEqual(3);
    expect(sut.estimatedUnrealizedPnL).toEqual(undefined);
    expect(sut.id).toEqual('1');
  });

  test('should calculate correct margin', () => {
    const sut = new Position(
      '1',
      instrument,
      'CROSS',
      new decimal(2511.81),
      new decimal(10.31),
      20
    );

    expect(sut.margin).toEqual(new decimal(0.5155));
    expect(sut.estimatedUnrealizedPnL).toEqual(undefined);
  });

  test('should calculate correct unrealized pnl', () => {
    const sut = new Position(
      '1',
      instrument,
      'CROSS',
      new decimal(2511.81),
      new decimal(10.31),
      20
    );

    const pnl = sut.calculateEstimatedUnrealizedPnL(new decimal(2576.44));

    expect(pnl).toEqual(new decimal(0.2652));
    expect(sut.estimatedUnrealizedPnL).toEqual(new decimal(0.2652));
  });
});
