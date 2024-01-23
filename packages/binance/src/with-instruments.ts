import { combineLatest, map } from 'rxjs';

import { Asset, d, Instrument } from '@quantform/core';

import { withExchangeInfoRequest } from './api/with-exchange-info-request';
import { withCommission } from './with-commission';

export function withInstruments() {
  return combineLatest([withExchangeInfoRequest(), withCommission()]).pipe(
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
