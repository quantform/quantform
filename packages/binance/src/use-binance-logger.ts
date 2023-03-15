import { useLogger, withMemo } from '@quantform/core';

export const useBinanceLogger = withMemo(() => useLogger('binance', '#F3BA2F'));
