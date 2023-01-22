import { Logger } from '@lib/shared';
import { useState } from '@lib/useState';

import { useReplayController } from './useReplayController';

export function useLogger(context: string) {
  const [logger] = useState(
    new Logger(context, () => useReplayController().timestamp()),
    [useLogger.name, context]
  );

  return logger;
}
