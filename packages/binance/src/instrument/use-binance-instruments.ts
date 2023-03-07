import { combineLatest, map, shareReplay } from 'rxjs';
import { z } from 'zod';

import { useBinanceCommission } from '@lib/commission';
import { useBinanceRequest } from '@lib/use-binance-request';
import {
  asReadonly,
  Asset,
  Commission,
  d,
  Instrument,
  useTimestamp,
  withMemo
} from '@quantform/core';

const BinanceInstrumentResponse = z.object({
  symbols: z.array(z.object({}))
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
export const useBinanceInstruments = withMemo(() =>
  combineLatest([
    useBinanceRequest<{ symbols: Array<any> }>({
      method: 'GET',
      patch: '/api/v3/exchangeInfo',
      query: {}
    }),
    useBinanceCommission()
  ]).pipe(
    map(([it, commission]) =>
      it.symbols.map(it => mapBinanceToInstrument(it, commission, useTimestamp()))
    ),
    shareReplay(1),
    asReadonly()
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
