import { deserialize } from 'borsh';
import { filter, map } from 'rxjs';

import { useMemo } from '@quantform/core';
import { Commitment } from '@quantform/solana';

import { watchProgramData } from './watch-program-data';

const layout = {
  struct: {
    discriminator: 'u64',
    mint: { array: { type: 'u8', len: 32 } },
    solAmount: 'u64',
    tokenAmount: 'u64',
    isBuy: 'bool',
    user: { array: { type: 'u8', len: 32 } },
    timestamp: 'i64',
    virtualSolReserves: 'u64',
    virtualTokenReserves: 'u64',
    realSolReserves: 'u64',
    realTokenReserves: 'u64'
  }
};

const discriminator = Buffer.from([189, 219, 127, 211, 78, 230, 97, 238]);

export function watchProgramTrade(commitment: Commitment) {
  return useMemo(
    () =>
      watchProgramData(commitment).pipe(
        filter(({ payload }) =>
          payload.program.subarray(0, discriminator.length).equals(discriminator)
        ),
        map(({ timestamp, payload }) => ({
          timestamp,
          payload: {
            context: payload.context,
            event: deserialize(layout, payload.program)
          }
        })),
        filter(({ payload }) => payload.event != null)
      ),
    ['pump-fun', watchProgramTrade.name, commitment]
  );
}
