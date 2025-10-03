import { useLogger as useCoreLogger, withMemo } from '@quantform/core';

export const useLogger = withMemo(() => useCoreLogger('pump-fun', '#86efad'));
