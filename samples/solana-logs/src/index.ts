import { tap } from 'rxjs';

import { behavior, strategy, useLogger } from '@quantform/core';
import { Commitment, solana, SolanaOptions, useSolana } from '@quantform/solana';

function trade() {
  const { info } = useLogger('solana-logs');
  const { watchProgram } = useSolana();

  return watchProgram(
    '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8',
    Commitment.Finalized,
    'jsonParsed'
  ).pipe(tap(it => info(it.payload.value.account.data)));
}

export default strategy(() => {
  behavior(() => trade());

  return [...solana(SolanaOptions.mainnet())];
});
