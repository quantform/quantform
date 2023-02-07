import { Logger, now } from '@lib/shared';

import { useExecutionMode } from './use-execution-mode';
import { useMemo } from './use-memo';
import { useReplayController } from './use-replay-controller';

export function useLogger(context: string) {
  const { mode } = useExecutionMode();

  const logger = useMemo(
    () =>
      new Logger(context, () =>
        mode === 'REPLAY' ? useReplayController().timestamp() : now()
      ),
    [useLogger.name, context]
  );

  return logger;
}
