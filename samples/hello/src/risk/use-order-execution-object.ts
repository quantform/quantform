import { map, Observable } from 'rxjs';

import {
  d,
  decimal,
  eq,
  InstrumentSelector,
  Storage,
  use,
  useSessionObject
} from '@quantform/core';

const object = Storage.createObject('order-execution-v2', {
  timestamp: 'number',
  id: 'string',
  instrument: 'string',
  rate: 'decimal',
  queueQuantityLeft: 'decimal'
});

export type ExecutionObject = {
  timestamp: number;
  id: string;
  instrument: InstrumentSelector;
  rate: decimal;
  queueQuantityLeft: decimal | undefined;
};

export const useOrderExecutionObject = use(
  (
    id: string,
    instrument: InstrumentSelector,
    rate: decimal
  ): Observable<
    [
      ExecutionObject,
      (object: { timestamp: number; queueQuantityLeft: decimal | undefined }) => void
    ]
  > => {
    const { query, save } = useSessionObject(object);

    const execution = {
      timestamp: 0,
      id,
      instrument,
      rate,
      queueQuantityLeft: undefined as decimal | undefined
    };

    return query({
      limit: 1,
      where: { instrument: eq(instrument.id), id: eq(id) },
      orderBy: 'DESC'
    }).pipe(
      map(([it]) => {
        if (it && it.queueQuantityLeft.greaterThan(d.Zero)) {
          execution.queueQuantityLeft = it.queueQuantityLeft;
        }

        return [
          execution,
          ({
            timestamp,
            queueQuantityLeft
          }: {
            timestamp: number;
            queueQuantityLeft: decimal | undefined;
          }) =>
            void save([
              {
                instrument: instrument.id,
                id,
                rate,
                timestamp,
                queueQuantityLeft: queueQuantityLeft ?? d.Zero
              }
            ])
        ];
      })
    );
  }
);
