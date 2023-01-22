import { Logger, now } from '@lib/shared';
import { useState } from '@lib/useState';

import { useExecutionMode } from './useExecutionMode';
import { useReplayController } from './useReplayController';

export function useLogger(context: string) {
  const { mode } = useExecutionMode();

  const [logger] = useState(
    new Logger(context, () =>
      mode === 'REPLAY' ? useReplayController().timestamp() : now()
    ),
    [useLogger.name, context]
  );

  return logger;
}
