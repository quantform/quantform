import { useBinanceOptions } from './use-binance-options';

export const useBinanceSimulator = () => {
  const { simulator } = useBinanceOptions();

  if (!simulator) {
    throw new Error('missing simulator options');
  }

  return simulator;
};
