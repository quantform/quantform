import {
  AdapterContext,
  Asset,
  cache,
  commissionPercentOf,
  InstrumentPatchEvent,
  precision,
  retry
} from '@quantform/core';

import { BinanceFutureAdapter } from '../binance-future-adapter';

export async function BinanceFutureAwakeHandler(
  context: AdapterContext,
  binanceFuture: BinanceFutureAdapter
): Promise<void> {
  await binanceFuture.endpoint.useServerTime();

  const response = await context.cache.tryGet(
    () => retry<any>(() => binanceFuture.endpoint.futuresExchangeInfo()),
    {
      key: 'binance-future-exchange-info'
    }
  );

  context.dispatch(
    ...(response.symbols as any[]).map(it => mapAsset(it, context, binanceFuture))
  );
}

function mapAsset(
  response: any,
  context: AdapterContext,
  binanceFuture: BinanceFutureAdapter
): InstrumentPatchEvent {
  const scale = {
    base: 8,
    quote: 8
  };

  for (const filter of response.filters) {
    switch (filter.filterType) {
      case 'PRICE_FILTER':
        scale.quote = precision(Number(filter['tickSize']));
        break;

      case 'LOT_SIZE':
        scale.base = precision(Number(filter['stepSize']));
        break;
    }
  }

  const base = new Asset(response.baseAsset, binanceFuture.name, scale.base);
  const quote = new Asset(response.quoteAsset, binanceFuture.name, scale.quote);

  return new InstrumentPatchEvent(
    context.timestamp,
    base,
    quote,
    commissionPercentOf(0.02, 0.04),
    response.symbol
  );
}
