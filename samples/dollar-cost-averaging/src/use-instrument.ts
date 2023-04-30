import { useBinanceInstrument } from '@quantform/binance';
import { instrumentOf } from '@quantform/core';

export function useInstrument() {
  return useBinanceInstrument(instrumentOf('binance:btc-usdt'));
}
