import { shareReplay } from 'rxjs';

import { useMemo } from '@quantform/core';

import { useBinanceInstrumentsQuery } from './use-binance-instruments-query';

/**
 *
 */
export function useBinanceInstruments() {
  return useMemo(
    () => useBinanceInstrumentsQuery().pipe(shareReplay(1)),
    [useBinanceInstruments.name]
  );
}
