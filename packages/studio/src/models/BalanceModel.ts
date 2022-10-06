import { Balance } from '@quantform/core';

export type BalanceModel = {
  key: string;
  asset: string;
  adapter: string;
  free: string;
  locked: string;
  timestamp: number;
};

export function toBalanceModel(balance: Balance): BalanceModel {
  return {
    key: balance.asset.id,
    asset: balance.asset.name,
    adapter: balance.asset.adapterName,
    free: balance.free.toFixed(balance.asset.scale),
    locked: balance.locked.toFixed(balance.asset.scale),
    timestamp: balance.timestamp
  };
}
