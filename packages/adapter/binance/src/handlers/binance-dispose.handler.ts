import { AdapterContext, AdapterDisposeCommand } from '@quantform/core';
import { BinanceAdapter } from '../';

export async function BinanceDisposeHandler(
  command: AdapterDisposeCommand,
  context: AdapterContext,
  binance: BinanceAdapter
) {
  for (const key in binance.endpoint.websockets.subscriptions()) {
    await binance.endpoint.websockets.terminate(key);
  }
}
