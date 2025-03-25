import { Dependency } from '@quantform/core';

import { useLogger } from './use-logger';
import { options, PumpFunOptions, useOptions } from './use-options';
import { watchProgramCompleted } from './watch-program-completed';
import { watchProgramCreate } from './watch-program-create';
import { watchProgramData } from './watch-program-data';
import { watchProgramLogs } from './watch-program-logs';
import { watchProgramSetParams } from './watch-program-set-params';
import { watchProgramTrade } from './watch-program-trade';

export function pumpFun(opts: Partial<PumpFunOptions>): Dependency[] {
  return [options(opts)];
}

export { PumpFunOptions };

export const usePumpFun = () => ({
  name: 'pump-fun' as const,
  useLogger,
  useOptions,
  watchProgramData,
  watchProgramCreate,
  watchProgramTrade,
  watchProgramCompleted,
  watchProgramSetParams,
  watchProgramLogs
});
