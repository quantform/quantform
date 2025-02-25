import { Dependency } from '@quantform/core';

import { Commitment } from './commitment';
import { useLogger } from './use-logger';
import { options, SolanaOptions, useOptions } from './use-options';
import { watchLogs } from './watch-logs';
import { watchProgram } from './watch-program';

export function solana(opts: Partial<SolanaOptions>): Dependency[] {
  return [options(opts)];
}

export { SolanaOptions, Commitment };

export const useSolana = () => ({
  name: 'hyperliquid' as const,
  useLogger,
  useOptions,
  watchLogs,
  watchProgram
});
