import * as dotenv from 'dotenv';
import { distinctUntilChanged, switchMap, tap } from 'rxjs';

import { behavior, strategy, useLogger } from '@quantform/core';
import { ethereum, useEthereum } from '@quantform/ethereum';

export default strategy(() => {
  dotenv.config();

  behavior(() => {
    const { withBalance, whenBlock } = useEthereum();
    const { info } = useLogger('web3-account');

    return whenBlock().pipe(
      tap(it => info(`new block: ${it}`)),
      switchMap(() => withBalance(process.env.ETH_WALLET_ADDRESS!)),
      distinctUntilChanged(),
      tap(it => info(`balance changed: ${it}`))
    );
  });

  return [
    ...ethereum({
      rpc: {
        wss: process.env.ETH_RPC_WSS
      }
    })
  ];
});
