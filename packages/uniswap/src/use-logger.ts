import { useLogger as useCoreLogger, withMemo } from '@quantform/core';

export const useLogger = withMemo(() => useCoreLogger('uniswap', '#FF007A'));
