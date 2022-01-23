import { AdapterContext } from '@quantform/core';
import { BinanceAdapter } from '../';

export async function BinanceDisposeHandler(
  context: AdapterContext,
  binance: BinanceAdapter
) {
  for (const key in binance.endpoint.websockets.subscriptions()) {
    await binance.endpoint.websockets.terminate(key);
  }
}
