import {
  combineLatest,
  distinctUntilChanged,
  distinctUntilKeyChanged,
  map,
  tap
} from 'rxjs';

import { Binance } from '@quantform/binance';
import {
  AssetSelector,
  d,
  distinctUntilTimestampChanged,
  instrumentNotSupported,
  InstrumentSelector,
  useLogger
} from '@quantform/core';

import { useOrderSize } from './use-order-size';

export const useArbitrageProfit = (
  a: AssetSelector,
  b: AssetSelector,
  c: AssetSelector
) => {
  const { debug } = useLogger('useArbitrageProfit');

  const arbitrage = {
    timestamp: 0,
    quantity: d.Zero,
    estimatedPnL: d.Zero,
    estimatedPnLPercent: d.Zero,
    a: {
      instrument: new InstrumentSelector(a.name, c.name, a.adapterName),
      quantity: d.Zero,
      rate: d.Zero
    },
    b: {
      instrument: new InstrumentSelector(a.name, b.name, a.adapterName),
      quantity: d.Zero,
      rate: d.Zero
    },
    c: {
      instrument: new InstrumentSelector(c.name, b.name, c.adapterName),
      quantity: d.Zero,
      rate: d.Zero
    }
  };

  return combineLatest([
    useOrderSize(arbitrage.a.instrument),
    Binance.useOrderbookTicker(arbitrage.a.instrument),
    Binance.useOrderbookTicker(arbitrage.b.instrument),
    Binance.useOrderbookTicker(arbitrage.c.instrument)
  ]).pipe(
    map(([size, a, b, c]) => {
      if (
        a === instrumentNotSupported ||
        b === instrumentNotSupported ||
        c === instrumentNotSupported
      ) {
        return arbitrage;
      }

      arbitrage.timestamp = Math.max(a.timestamp, b.timestamp, c.timestamp);
      arbitrage.quantity = size;

      arbitrage.a.rate = a.bids.rate;
      arbitrage.b.rate = b.bids.rate;
      arbitrage.c.rate = c.asks.rate;

      arbitrage.a.quantity = a.instrument.base.floor(
        arbitrage.quantity.div(arbitrage.a.rate)
      );
      arbitrage.b.quantity = b.instrument.quote.floor(
        arbitrage.a.quantity.mul(arbitrage.b.rate)
      );
      arbitrage.c.quantity = c.instrument.base.floor(
        arbitrage.b.quantity.div(arbitrage.c.rate)
      );

      arbitrage.estimatedPnL = arbitrage.c.quantity.minus(arbitrage.quantity);
      arbitrage.estimatedPnLPercent = arbitrage.c.quantity
        .div(arbitrage.quantity)
        .minus(1)
        .mul(100);

      return arbitrage;
    }),
    tap(arbitrage => {
      const { a, b, c, estimatedPnL, estimatedPnLPercent } = arbitrage;

      debug(
        `${a.instrument.base}(${a.rate.toFixed()}) -> ${
          b.instrument.base
        }(${b.rate.toFixed()}) -> ${
          c.instrument.base
        }(${c.rate.toFixed()}) = ${estimatedPnL.toFixed()}(${estimatedPnLPercent.toFixed(
          4
        )}%)`
      );
    })
  );
};
