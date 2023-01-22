import { Logger } from '@lib/shared';
import { useState } from '@lib/useState';

import { useBacktesting } from './useBacktesting';

export function useLogger(context: string) {
  const [logger] = useState(new Logger(context, () => useBacktesting().timestamp()), [
    useLogger.name,
    context
  ]);

  return logger;
}
