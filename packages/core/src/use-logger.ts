import { Logger, now } from '@lib/shared';

import { useExecutionMode } from './use-execution-mode';
import { useMemo } from './use-memo';
import { useReplayController } from './replay/use-replay-controller';

export function useLogger({ context, hexColor }: { context: string; hexColor: string }) {
  const { mode } = useExecutionMode();

  const logger = useMemo(
    () =>
      new Logger(context, hexColor, () =>
        mode === 'REPLAY' ? useReplayController().timestamp() : now()
      ),
    [useLogger.name, context]
  );

  return logger;
}
