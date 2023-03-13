import { useLogger, withMemo } from '@quantform/core';

export const useBinanceLogger = withMemo(() =>
  useLogger({
    context: 'binance',
    hexColor: '#F3BA2F'
  })
);
