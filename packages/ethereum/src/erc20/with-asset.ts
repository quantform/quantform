import { combineLatest, from, map, Observable } from 'rxjs';
import { z } from 'zod';

import { Asset, useMemo } from '@quantform/core';

import { useERC20Contract } from './use-erc20-contract';

export function withAsset(address: string): Observable<Asset> {
  const contract = useERC20Contract(address);

  return useMemo(
    () =>
      combineLatest([
        from(contract.decimals()).pipe(map(it => z.bigint().parse(it))),
        from(contract.symbol()).pipe(map(it => z.string().parse(it)))
      ]).pipe(map(([scale, name]) => new Asset(name, address, Number(scale)))),
    ['ethereum', 'asset', address]
  );

  {
    /*balanceOf(address: string) {
        return from(contract.balanceOf(address)).pipe(
          map(it => d(z.bigint().parse(it).toString()))
        );
      }*/
  }
}
