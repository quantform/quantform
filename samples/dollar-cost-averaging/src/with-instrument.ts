import { useBinance } from '@quantform/binance';
import { instrumentOf } from '@quantform/core';

export function withInstrument() {
  const { withInstrument } = useBinance();

  return withInstrument(instrumentOf('binance:btc-usdt'));
}
