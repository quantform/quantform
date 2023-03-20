import { combineLatest, map } from 'rxjs';
import { z } from 'zod';

import { useCommission } from '@lib/commission';
import { useBinanceRequest } from '@lib/use-binance-request';
import { Asset, Commission, d, Instrument, use, useTimestamp } from '@quantform/core';

const schema = z.object({
  symbols: z.array(z.any())
});

/**
 * @title useBinanceInstrument
 * @description
 * Subscribes for specific instrument changes. Under the hood, the subscription will
 * request a list of all tradeable instruments and return the specific one.
 *
 * @example
 * const btc_usdt = useBinanceInstrument(instrumentOf('binance:btc-usdt'));
 */
export const useInstruments = use(() =>
  combineLatest([
    useBinanceRequest(schema, {
      method: 'GET',
      patch: '/api/v3/exchangeInfo',
      query: {}
    }),
    useCommission()
  ]).pipe(
    map(([it, commission]) =>
      it.symbols.map(it => mapBinanceToInstrument(it, commission, useTimestamp()))
    )
  )
);

function mapBinanceToInstrument(
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
