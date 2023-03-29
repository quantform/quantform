import { map } from 'rxjs';

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
  queueQuantityLeft: 'decimal'
});

export const useOrderExecutionObject = use(
  (id: string, instrument: InstrumentSelector) => {
    const { query, save } = useSessionObject(object);

    const execution = {
      timestamp: 0,
      id,
      instrument,
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

        return execution;
      })
    );
  }
);
