import { map } from 'rxjs';
import { z } from 'zod';

import { d, useSocket } from '@quantform/core';

const schema = z.object({
  stream: z.string(),
  data: z.object({
    p: z.string(),
    q: z.string()
  })
});

export function watchAggTradeLive(symbol: string) {
  const { watch } = useSocket(
    `wss://fstream.binance.com/stream?streams=${symbol.toLowerCase()}@aggTrade`
  );

  return watch().pipe(
    map(({ timestamp, payload }) => {
      const { data } = schema.parse(payload);

      return { timestamp, payload: { price: d(data.p), size: d(data.q) } };
    })
  );
}
