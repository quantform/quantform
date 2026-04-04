import csv from 'csv-parser';
import { map } from 'rxjs';
import { Readable } from 'stream';
import unzipper from 'unzipper';
import { z } from 'zod';

import { add, convert, d, uri, us, useReplayStorage } from '@quantform/core';

const schema = z.object({ 1: z.string(), 2: z.string() });
const DAY_NS = convert(us(86_400_000_000n), 'us', 'ns');

export function watchTradeReplay(symbol: string) {
  const { watch } = useReplayStorage(uri(`binance://trade`, { symbol }), {
    sync: async (query, storage) => {
      const { min, max } = query.where.timestamp;

      for (let time = min; time <= max; time = add(time, DAY_NS)) {
        const date = new Date(Number(convert(time, 'ns', 'ms')));

        for await (const payload of queryTradeHistory(date, symbol)) {
          const timestamp = convert(us(BigInt(payload[4])), 'us', 'ns');

          await storage.save([{ timestamp, payload }]);
        }
      }
    }
  });

  return watch().pipe(
    map(({ timestamp, payload }) => {
      const { 1: price, 2: quantity } = schema.parse(payload);

      return { timestamp, payload: { price: d(price), size: d(quantity) } };
    })
  );
}

async function* queryTradeHistory(date: Date, symbol: string) {
  const yyyyMMdd = date.toISOString().slice(0, 10);

  const response = await fetch(
    `https://data.binance.vision/data/spot/daily/trades/${symbol.toUpperCase()}/${symbol.toUpperCase()}-trades-${yyyyMMdd}.zip`
  );

  yield* Readable.fromWeb(response.body as any)
    .pipe(unzipper.ParseOne(/\.csv$/))
    .pipe(csv({ headers: false }));
}
