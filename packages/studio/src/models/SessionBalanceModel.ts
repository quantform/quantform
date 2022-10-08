import { Balance } from '@quantform/core';
import { z } from 'zod';

export const SessionBalanceContract = z.object({
  key: z.string(),
  asset: z.string(),
  adapter: z.string(),
  free: z.string(),
  locked: z.string(),
  timestamp: z.number()
});

export type SessionBalanceModel = z.infer<typeof SessionBalanceContract>;

export function toSessionBalanceModel(balance: Balance): SessionBalanceModel {
  return {
    key: balance.asset.id,
    asset: balance.asset.name,
    adapter: balance.asset.adapterName,
    free: balance.free.toFixed(balance.asset.scale),
    locked: balance.locked.toFixed(balance.asset.scale),
    timestamp: balance.timestamp
  };
}
