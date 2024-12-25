import { from, map } from 'rxjs';
import { z } from 'zod';

import { Asset, d } from '@quantform/core';

import { useERC20Contract } from './use-erc20-contract';

export function withBalance(asset: Asset, owner: string) {
  const contract = useERC20Contract(asset.adapterName);

  return from(contract.balanceOf(owner)).pipe(
    map(it => d(z.bigint().parse(it).toString()))
  );
}
