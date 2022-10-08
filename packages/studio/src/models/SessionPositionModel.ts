import { Position } from '@quantform/core';
import { z } from 'zod';

export const SessionPositionContract = z.object({
  key: z.string(),
  instrument: z.string(),
  size: z.string(),
  averageExecutionRate: z.string(),
  leverage: z.number(),
  mode: z.string(),
  estimatedUnrealizedPnL: z.string().optional(),
  timestamp: z.number()
});

export type SessionPositionModel = z.infer<typeof SessionPositionContract>;

export function toSessionPositionModel(position: Position): SessionPositionModel {
  return {
    ...position,
    key: position.id,
    instrument: position.instrument.id,
    size: position.size.toString(),
    averageExecutionRate: position.averageExecutionRate.toString(),
    estimatedUnrealizedPnL: position.estimatedUnrealizedPnL?.toString()
  };
}
