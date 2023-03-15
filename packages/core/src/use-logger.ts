import { Logger, now } from '@lib/shared';

import { useReplayCoordinator } from './replay/use-replay-coordinator';
import { useExecutionMode } from './use-execution-mode';
import { useMemo } from './use-memo';

export function useLogger({ context, hexColor }: { context: string; hexColor: string }) {
  const { mode } = useExecutionMode();

  const logger = useMemo(
    () =>
      new Logger(context, hexColor, () =>
        mode === 'REPLAY' ? useReplayCoordinator().timestamp() : now()
      ),
    [useLogger.name, context]
  );

  return logger;
}
