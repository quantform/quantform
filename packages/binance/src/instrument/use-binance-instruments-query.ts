import { combineLatest, map } from 'rxjs';
import { z } from 'zod';

import { useBinanceCommission } from '@lib/commission';
import { useBinanceRequest } from '@lib/use-binance-request';
import { Asset, Commission, d, Instrument, useTimestamp } from '@quantform/core';

const BinanceInstrumentResponse = z.object({
  symbols: z.array(z.object({}))
});

/**
 *
 */
export function useBinanceInstrumentsQuery() {
  return combineLatest([
    useBinanceRequest<{ symbols: Array<any> }>({
      method: 'GET',
      patch: '/api/v3/exchangeInfo',
      query: {}
    }),
    useBinanceCommission()
  ]).pipe(
    map(([it, commission]) =>
      it.symbols.map(it => mapBinanceToInstrument(it, commission, useTimestamp()))
    )
  );
}

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
