import { useLogger as useCoreLogger, withMemo } from '@quantform/core';

export const useLogger = withMemo(() => useCoreLogger('binance', '#F3BA2F'));
