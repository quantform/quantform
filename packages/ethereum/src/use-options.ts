import { provider, useContext } from '@quantform/core';

@provider()
export class EthereumOptions {
  rpc: {
    wss?: string;
  } = {
    wss: undefined
  };
}

export function options(options: Partial<EthereumOptions>) {
  return {
    provide: EthereumOptions,
    useValue: { ...new EthereumOptions(), ...options }
  };
}

export function useOptions() {
  return useContext(EthereumOptions);
}
