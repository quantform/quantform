import { useBinanceOptions } from './use-binance-options';

export const useBinanceSimulatorOptions = () => {
  const { simulator } = useBinanceOptions();

  if (!simulator) {
    throw new Error('missing simulator options');
  }

  return simulator;
};
