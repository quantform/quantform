import { shareReplay } from 'rxjs';

import { asReadonly, useMemo } from '@quantform/core';

import { useBinanceInstrumentsQuery } from './use-binance-instruments-query';

/**
 * @title useBinanceInstrument
 * @description
 * Subscribes for specific instrument changes. Under the hood, the subscription will
 * request a list of all tradeable instruments and return the specific one.
 *
 * @example
 * const btc_usdt = useBinanceInstrument(instrumentOf('binance:btc-usdt'));
 */
export function useBinanceInstruments() {
  return useMemo(
    () => useBinanceInstrumentsQuery().pipe(shareReplay(1), asReadonly()),
    [useBinanceInstruments.name]
  );
}
