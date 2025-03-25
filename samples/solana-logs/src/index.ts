import { tap } from 'rxjs';

import { behavior, strategy, useLogger } from '@quantform/core';
import { pumpFun, usePumpFun } from '@quantform/pump-fun';
import { Commitment, solana, SolanaOptions } from '@quantform/solana';
import { sqlite } from '@quantform/sqlite';

function trade() {
  const { info } = useLogger('solana-logs');
  const { watchProgramTrade } = usePumpFun();

  return watchProgramTrade(Commitment.Finalized).pipe(
    tap(it => info('', it.payload.event))
  );
}

export default strategy(() => {
  behavior(() => trade());

  sqlite();
  return [...solana(SolanaOptions.mainnet()), ...pumpFun({}), sqlite()];
});
