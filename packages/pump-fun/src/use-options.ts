import { provider, useContext } from '@quantform/core';

@provider()
export class PumpFunOptions {
  programId = '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P';
}

export function options(options: Partial<PumpFunOptions>) {
  return {
    provide: PumpFunOptions,
    useValue: { ...new PumpFunOptions(), ...options }
  };
}

export function useOptions() {
  return useContext(PumpFunOptions);
}
