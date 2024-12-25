import * as dotenv from 'dotenv';
import { catchError, EMPTY, of, tap } from 'rxjs';

import { after, before, behavior, strategy, useLogger } from '@quantform/core';
import { ethereum, useEthereum } from '@quantform/ethereum';

export default strategy(() => {
  dotenv.config();

  before(() => of(1));

  behavior(() => {
    const { withBalance } = useEthereum();
    const { info } = useLogger('web3-account');

    return withBalance(process.env.ETH_WALLET_ADDRESS!).pipe(
      tap(it => info(it)),
      catchError(e => {
        info(`${e}`);
        return EMPTY;
      })
    );
  });

  after(() => of(1));

  return [
    ...ethereum({
      rpc: {
        wss: process.env.ETH_RPC_WSS
      }
    })
  ];
});
