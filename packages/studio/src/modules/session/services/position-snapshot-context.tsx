import { Position } from '@quantform/core';
import { createSnapshotContext } from '.';

export interface PositionSnapshot {
  key: string;
  instrument: string;
  size: number;
  averageExecutionRate: number;
  leverage: number;
  mode: string;
  estimatedUnrealizedPnL: number;
  kind: string;
}

export function getPositionSnapshot(position: Position): PositionSnapshot {
  return {
    ...position,
    key: position.id,
    instrument: position.instrument.toString()
  };
}

export const [usePositionSnapshotContext, PositionSnapshotProvider] =
  createSnapshotContext<PositionSnapshot>({});
