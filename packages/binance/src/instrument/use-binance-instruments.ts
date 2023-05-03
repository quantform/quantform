import { combineLatest, map } from 'rxjs';

import { useBinanceCommission } from '@lib/commission';
import { Asset, d, Instrument, withMemo } from '@quantform/core';

import { useBinanceInstrumentsRequest } from './use-binance-instruments-request';

/**
 * @title useInstruments
 * @description
 * Subscribes for specific instrument changes. Under the hood, the subscription will
 * request a list of all tradeable instruments and return the specific one.
 *
 * @example
 * const btc_usdt = useBinanceInstrument(instrumentOf('binance:btc-usdt'));
 */
export const useBinanceInstruments = withMemo(() =>
  combineLatest([useBinanceInstrumentsRequest(), useBinanceCommission()]).pipe(
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
  )
);
