import { combineLatest, map } from 'rxjs';

import { withExchangeInfoRequest } from '@lib/api';
import { Asset, d, Instrument } from '@quantform/core';

import { getCommission } from './get-commission';

export function getInstruments() {
  return combineLatest([withExchangeInfoRequest(), getCommission()]).pipe(
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
