import { Position } from '@quantform/core';

export type PositionModel = {
  key: string;
  instrument: string;
  size: string;
  averageExecutionRate: string;
  leverage: number;
  mode: string;
  estimatedUnrealizedPnL?: string;
  timestamp: number;
};

export function toPositionModel(position: Position): PositionModel {
  return {
    ...position,
    key: position.id,
    instrument: position.instrument.id,
    size: position.size.toString(),
    averageExecutionRate: position.averageExecutionRate.toString(),
    estimatedUnrealizedPnL: position.estimatedUnrealizedPnL?.toString()
  };
}
