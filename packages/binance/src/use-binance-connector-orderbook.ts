import { map } from 'rxjs';

import { useBinanceSocket } from '@lib/use-binance-socket';
import { Instrument, useReplay, useTimestamp } from '@quantform/core';

export function useBinanceConnectorOrderbook(instrument: Instrument) {
  return useReplay(
    useBinanceSocket(`ws/${instrument.raw.toLowerCase()}@bookTicker`).pipe(
      map(payload => ({ timestamp: useTimestamp(), payload }))
    ),
    [useBinanceConnectorOrderbook.name, instrument.id]
  );
}
