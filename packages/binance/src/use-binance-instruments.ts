import { combineLatest, from, map, Observable, shareReplay, switchMap } from 'rxjs';

import {
  Asset,
  Commission,
  d,
  Instrument,
  useCache,
  useTimestamp,
  withMemo
} from '@quantform/core';

import { useBinanceCommission } from '@lib/use-binance-commission';
import { useBinanceConnector } from '@lib/use-binance-connector';

export const useBinanceInstruments = withMemo(binanceInstruments);

function binanceInstruments(): Observable<Instrument[]> {
  return useBinanceConnector().pipe(
    switchMap(it =>
      combineLatest([
        from(useCache(() => it.getExchangeInfo(), ['get-exchange-info'])),
        useBinanceCommission()
      ])
    ),
    map(([it, commission]) =>
      it.symbols.map(it => mapBinanceToInstrument(it, commission, useTimestamp()))
    ),
    shareReplay(1)
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
