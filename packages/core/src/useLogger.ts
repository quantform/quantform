import { Logger } from '@lib/shared';
import { useState } from '@lib/useState';

export function useLogger(context: string) {
  const [logger] = useState(new Logger(context), [useLogger.name, context]);

  return logger;
}
