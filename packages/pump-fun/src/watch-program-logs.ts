import { mergeMap } from 'rxjs';

import { useMemo } from '@quantform/core';
import { Commitment, useSolana } from '@quantform/solana';

import { useOptions } from './use-options';

const PROGRAM_LOGS = 'Program log: ';

export function watchProgramLogs(commitment: Commitment) {
  const { programId } = useOptions();
  const { watchLogs } = useSolana();

  return useMemo(
    () =>
      watchLogs(programId, commitment).pipe(
        mergeMap(({ timestamp, payload }) =>
          payload.value.logs
            .filter(it => it.startsWith(PROGRAM_LOGS))
            .map(it => ({
              timestamp,
              payload: {
                context: payload.context,
                log: Buffer.from(it.slice(PROGRAM_LOGS.length), 'base64'),
                signature: payload.value.signature
              }
            }))
        )
      ),
    ['pump-fun', watchProgramLogs.name, commitment]
  );
}
