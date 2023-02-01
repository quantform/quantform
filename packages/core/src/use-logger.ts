import { Logger, now } from '@lib/shared';
import { useState } from '@lib/use-state';

import { useExecutionMode } from './use-execution-mode';
import { useReplayController } from './use-replay-controller';

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
