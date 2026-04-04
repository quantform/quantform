import { map, retry } from 'rxjs';
import { z } from 'zod';

import { d, useSocket } from '@quantform/core';

const schema = z.object({
  stream: z.string(),
  data: z.object({
    p: z.string(),
    q: z.string()
  })
});

export function watchTradeLive(symbol: string) {
  const { watch } = useSocket(
    `wss://fstream.binance.com/stream?streams=${symbol.toLowerCase()}@trade`
  );

  return watch().pipe(
    retry(),
    map(({ timestamp, payload }) => {
      const { data } = schema.parse(payload);

      return { timestamp, payload: { price: d(data.p), size: d(data.q) } };
    })
  );
}
