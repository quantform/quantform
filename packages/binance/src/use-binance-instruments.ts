import { map, Observable, shareReplay, switchMap } from 'rxjs';

import { Asset, commissionPercentOf, d, Instrument, withMemo } from '@quantform/core';

import { useBinanceConnector } from '@lib/use-binance-connector';

export const useBinanceInstruments = withMemo(binanceInstruments);

function binanceInstruments(): Observable<Instrument[]> {
  return useBinanceConnector().pipe(
    switchMap(it => it.getExchangeInfo()),
    map(it => it.symbols.map(it => mapBinanceToInstrument(it, 0))),
    shareReplay(1)
  );
}

function mapBinanceToInstrument(response: any, timestamp: number): Instrument {
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
    commissionPercentOf({ maker: d(0.1), taker: d(0.1) })
  );
}
