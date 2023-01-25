import { combineLatest, from, map, Observable, shareReplay, switchMap } from 'rxjs';

import { useBinanceCommission } from '@lib/commission/use-binance-commission';
import { useBinanceConnector } from '@lib/use-binance-connector';
import {
  Asset,
  Commission,
  d,
  Instrument,
  useCache,
  useState,
  useTimestamp
} from '@quantform/core';

export function useBinanceInstruments() {
  const [instruments] = useState(binanceInstruments(), [useBinanceInstruments.name]);

  return instruments;
}

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
