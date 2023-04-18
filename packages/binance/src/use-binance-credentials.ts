import { useBinanceOptions } from './use-binance-options';

export const useBinanceCredentials = () => {
  const { apiKey, apiSecret } = useBinanceOptions();

  if (!apiKey || !apiSecret) {
    throw new Error('missing api key or secret!');
  }

  return { apiKey, apiSecret };
};
