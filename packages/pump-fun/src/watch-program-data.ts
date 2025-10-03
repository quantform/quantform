import { mergeMap } from 'rxjs';

import { useMemo } from '@quantform/core';
import { Commitment, useSolana } from '@quantform/solana';

import { useOptions } from './use-options';

const PROGRAM_DATA = 'Program data: ';

export function watchProgramData(commitment: Commitment) {
  const { programId } = useOptions();
  const { watchLogs } = useSolana();

  return useMemo(
    () =>
      watchLogs(programId, commitment).pipe(
        mergeMap(({ timestamp, payload }) =>
          payload.value.logs
            .filter(it => it.startsWith(PROGRAM_DATA))
            .map(it => ({
              timestamp,
              payload: {
                context: payload.context,
                program: Buffer.from(it.slice(PROGRAM_DATA.length), 'base64'),
                signature: payload.value.signature
              }
            }))
        )
      ),
    ['pump-fun', watchProgramData.name, commitment]
  );
}
