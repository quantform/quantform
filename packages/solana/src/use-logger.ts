import { useLogger as useCoreLogger, withMemo } from '@quantform/core';

export const useLogger = withMemo(() => useCoreLogger('solana', '#50d2c1'));
