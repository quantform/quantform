import { Token } from '@uniswap/sdk-core';

import { Commission, decimal, provider, useContext } from '@quantform/core';

@provider()
export class UniswapOptions {
  rpc: {
    wss?: string;
  } = {
    wss: undefined
  };

  factoryAddress = '0x1F98431c8aD98523631AE4a59f267346ea31F984';

  token: {
    query: () => Promise<Pick<Token, 'address' | 'decimals' | 'symbol'>[]>;
  } = {
    query: () => Promise.resolve([])
  };

  simulator?: {
    balance: Record<string, { free: decimal }>;
    commission: Commission;
  };
}

export function options(options: Partial<UniswapOptions>) {
  return {
    provide: UniswapOptions,
    useValue: { ...new UniswapOptions(), ...options }
  };
}

export function useOptions() {
  return useContext(UniswapOptions);
}
