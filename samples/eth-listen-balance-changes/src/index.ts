import * as dotenv from 'dotenv';
import { catchError, EMPTY, tap } from 'rxjs';

import { behavior, strategy, useLogger } from '@quantform/core';
import { ethereum, useEthereum } from '@quantform/ethereum';

export default strategy(() => {
  dotenv.config();

  behavior(() => {
    const { withBalance } = useEthereum();
    const { info } = useLogger('web3-account');

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return withBalance(process.env.ETH_WALLET_ADDRESS!).pipe(
      tap(it => info(it)),
      catchError(e => {
        info(`${e}`);
        return EMPTY;
      })
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
