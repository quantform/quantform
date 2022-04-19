import {
  AdapterContext,
  Asset,
  cache,
  commissionPercentOf,
  InstrumentPatchEvent,
  precision,
  retry
} from '@quantform/core';

import { BinanceAdapter } from '../binance.adapter';

function mapInstrument(
  response: any,
  context: AdapterContext,
  binance: BinanceAdapter
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

  const base = new Asset(response.baseAsset, binance.name, scale.base);
  const quote = new Asset(response.quoteAsset, binance.name, scale.quote);

  return new InstrumentPatchEvent(
    context.timestamp,
    base,
    quote,
    commissionPercentOf(0.1, 0.1),
    response.symbol
  );
}

export async function BinanceAwakeHandler(
  context: AdapterContext,
  binance: BinanceAdapter
): Promise<void> {
  await binance.endpoint.useServerTime();
  console.time('binance');
  const response = await cache('binance-exchange-info', () =>
    retry<any>(() => binance.endpoint.exchangeInfo())
  );
  console.timeEnd('binance');

  context.dispatch(
    ...(response.symbols as any[]).map(it => mapInstrument(it, context, binance))
  );
}
