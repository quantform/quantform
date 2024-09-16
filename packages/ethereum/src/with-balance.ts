import { formatEther } from 'ethers';
import { from, map } from 'rxjs';

import { d } from '@quantform/core';

import { useProvider } from './use-provider';

export function withBalance(address: string) {
  const provider = useProvider();

  return from(provider.getBalance(address)).pipe(map(value => d(formatEther(value))));
}
