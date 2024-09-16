import { Dependency } from '@quantform/core';

import { useLogger } from './use-logger';
import { EthereumOptions, options, useOptions } from './use-options';

export function ethereum(opts: Partial<EthereumOptions>): Dependency[] {
  return [options(opts)];
}

export const useEthereum = () => ({
  name: 'ethereum' as const,
  useLogger,
  useOptions
});
