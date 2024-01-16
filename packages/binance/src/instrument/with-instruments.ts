import { combineLatest, map, tap } from 'rxjs';
import { v4 } from 'uuid';

import { withCommission } from '@lib/commission';
import { useSimulator } from '@lib/simulator';
import {
  Asset,
  d,
  Instrument,
  useExecutionMode,
  useReplayBreakpoint,
  withMemo
} from '@quantform/core';

import { withExchangeInfo } from './with-exchange-info';

/**
 * @title useInstruments
 *
 * The `useBinanceInstruments` function is a utility function that retrieves and
 * processes instrument data from Binance. It returns an Observable that emits an
 * array of `Instrument` objects. The function combines the results of two
 * observables: `useBinanceInstrumentsRequest()`, which retrieves instrument data
 * from Binance, and `useBinanceCommission()`, which retrieves commission data.
 *
 * The function maps over the received instrument data, extracting relevant
 * information such as the timestamp, base and quote assets, symbol, and
 * commission. It also calculates the scaling factors for the assets based on
 * the filters associated with each instrument. These filters include price and
 * lot size restrictions, which determine the decimal places for each asset.
 *
 * @example
 * const btc_usdt = useBinanceInstrument(instrumentOf('binance:btc-usdt'));
 */
function withBinanceInstruments() {
  return combineLatest([withExchangeInfo(), withCommission()]).pipe(
    map(([{ timestamp, payload }, commission]) =>
      payload.symbols.map(it => {
        const scale = { base: 8, quote: 8 };

        for (const filter of it.filters) {
          switch (filter.filterType) {
            case 'PRICE_FILTER':
              scale.quote = d(filter.tickSize).decimalPlaces();
              break;
            case 'LOT_SIZE':
              scale.base = d(filter.stepSize).decimalPlaces();
              break;
          }
        }

        return new Instrument(
          timestamp,
          new Asset(it.baseAsset, 'binance', scale.base),
          new Asset(it.quoteAsset, 'binance', scale.quote),
          it.symbol,
          commission
        );
      })
    )
  );
}

export type withInstrumentsType = typeof withBinanceInstruments;

export const withInstruments = withMemo((): ReturnType<withInstrumentsType> => {
  const { isSimulation } = useExecutionMode();

  if (!isSimulation) {
    return withBinanceInstruments();
  }

  const { apply } = useSimulator();

  return useReplayBreakpoint(
    withBinanceInstruments().pipe(
      tap(payload =>
        apply({ type: 'with-instruments-response', payload, correlationId: v4() })
      )
    )
  );
});
