import { Dependency } from '@quantform/core';

import { useLogger } from './use-logger';
import { options, UniswapOptions, useOptions } from './use-options';
import { whenSwap } from './when-swap';
import { withToken } from './with-token';
import { withTokens } from './with-tokens';

export function uniswap(opts: Partial<UniswapOptions>): Dependency[] {
  return [options(opts)];
}

export const useUniswap = () => ({
  name: 'uniswap' as const,
  useLogger,
  useOptions,
  withToken,
  withTokens,
  whenSwap
});
