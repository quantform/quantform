import { Balance } from '@quantform/core';
import { createSnapshotContext } from '.';

export type BalanceSnapshot = {
  key: string;
  asset: string;
  adapter: string;
  free: number;
  locked: number;
  scale: number;
  kind: string;
};

export const [useBalanceSnapshotContext, BalanceSnapshotProvider] =
  createSnapshotContext<BalanceSnapshot>({});

export function getBalanceSnapshot(balance: Balance): BalanceSnapshot {
  return {
    key: balance.asset.toString(),
    asset: balance.asset.name,
    adapter: balance.asset.adapter,
    free: balance.free,
    locked: balance.locked,
    scale: balance.asset.scale,
    kind: balance.kind
  };
}
