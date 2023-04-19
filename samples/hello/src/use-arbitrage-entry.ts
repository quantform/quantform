import { filter, map } from 'rxjs';

import { AssetSelector, InstrumentSelector } from '@quantform/core';

import { useArbitrageEntryDecision } from './use-arbitrage-entry-decision';
import { useOrderbookCross } from './use-orderbook-cross';

export function useArbitrageEntry(a: AssetSelector, b: AssetSelector, c: AssetSelector) {
  const x = new InstrumentSelector(a.name, c.name, a.adapterName);
  const y = new InstrumentSelector(a.name, b.name, a.adapterName);
  const z = new InstrumentSelector(c.name, b.name, c.adapterName);

  return useOrderbookCross(x, y, z);
}
