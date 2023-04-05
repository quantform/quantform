import { combineLatest, map } from 'rxjs';

import { useCommission } from '@lib/commission';
import { Asset, Commission, d, Instrument, use } from '@quantform/core';

import { useInstrumentsRequest } from './use-instruments-request';

/**
 * @title useInstruments
 * @description
 * Subscribes for specific instrument changes. Under the hood, the subscription will
 * request a list of all tradeable instruments and return the specific one.
 *
 * @example
 * const btc_usdt = useBinanceInstrument(instrumentOf('binance:btc-usdt'));
 */
export const useInstruments = use(() =>
  combineLatest([useInstrumentsRequest(), useCommission()]).pipe(
    map(([{ timestamp, payload }, commission]) =>
      payload.symbols.map(it => mapInstrument(it, commission, timestamp))
    )
  )
);

function mapInstrument(
  response: any,
  commission: Commission,
  timestamp: number
): Instrument {
  const scale = { base: 8, quote: 8 };

  for (const filter of response.filters) {
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
    new Asset(response.baseAsset, 'binance', scale.base),
    new Asset(response.quoteAsset, 'binance', scale.quote),
    response.symbol,
    commission
  );
}
