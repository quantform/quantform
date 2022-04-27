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
    const sut = new Position('1', instrument);

    expect(sut.id).toEqual('1');
    expect(sut.toString()).toEqual('1');
  });

  test('should calculate correct margin', () => {
    const sut = new Position('1', instrument);

    sut.size = 10.31;
    sut.averageExecutionRate = 2511.81;
    sut.leverage = 20;

    expect(sut.margin).toEqual(0.5155);
    expect(sut.estimatedUnrealizedPnL).toEqual(0);
  });

  test('should calculate correct unrealized pnl', () => {
    const sut = new Position('123', instrument);

    sut.size = 10.31;
    sut.averageExecutionRate = 2511.81;
    sut.leverage = 20;

    sut.calculateEstimatedUnrealizedPnL(2576.44);

    expect(sut.estimatedUnrealizedPnL).toEqual(0.2652);
  });
});
