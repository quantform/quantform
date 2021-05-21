import { Asset } from './asset';
import { Instrument } from './instrument';
import { Position } from './position';

const instrument = new Instrument(
  new Asset('abc', 'xyz', 4),
  new Asset('def', 'xyz', 4),
  'abc-def'
);

describe('position tests', () => {
  test('should instantiate proper position', () => {
    const sut = new Position('123', instrument);

    sut.size = 5;
    sut.averageExecutionRate = 20;
    sut.leverage = 20;

    expect(sut.margin).toEqual(5);
    expect(sut.estimatedUnrealizedPnL).toEqual(0);
  });

  test('should calculate unrealized pnl', () => {
    const sut = new Position('123', instrument);

    sut.size = -5;
    sut.averageExecutionRate = 20;
    sut.leverage = 20;

    sut.calculatePnL(10);

    expect(sut.margin).toEqual(5);
    expect(sut.estimatedUnrealizedPnL).toEqual(50);
  });
});
