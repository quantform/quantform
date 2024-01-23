import { filter, map, switchMap } from 'rxjs';

import { d, InstrumentSelector, useTimestamp } from '@quantform/core';

import { whenUserAccountSocket } from './api/when-user-account-socket';
import { withInstrument } from './with-instrument';

export const whenOrder = (selector: InstrumentSelector) =>
  withInstrument(selector).pipe(
    switchMap(instrument =>
      whenUserAccountSocket().pipe(
        filter(
          it => it.payload.e === 'executionReport' && it.payload.s === instrument.raw
        ),
        map(it => {
          if (it.payload.e !== 'executionReport') {
            return undefined;
          }

          const { payload } = it;
          const clientOrderId = payload.C?.length > 0 ? payload.C : payload.c;
          const quantity = d(payload.q);

          return {
            timestamp: useTimestamp(),
            id: clientOrderId,
            binanceId: payload.i,
            instrument,
            quantity: payload.S == 'BUY' ? quantity : quantity.mul(-1),
            side: payload.S == 'BUY' ? 'BUY' : 'SELL',
            createdAt: payload.T,
            rate: payload.p ? d(payload.p) : undefined,
            quantityExecuted: payload.z ? d(payload.z) : undefined,
            averageExecutionRate: d.Zero,
            executionType: payload.x,
            status: payload.X
          };
        })
      )
    )
  );
