import csv from 'csv-parser';
import { map } from 'rxjs';
import { Readable } from 'stream';
import unzipper from 'unzipper';
import { z } from 'zod';

import { d, uri, useReplayStorage } from '@quantform/core';

const schema = z.object({
  1: z.string(),
  2: z.string()
});

const DAY_MS = 24 * 60 * 60 * 1000;

export function watchAggTradeReplay(symbol: string) {
  const { watch } = useReplayStorage(uri(`binance://aggTrade`, { symbol }), {
    sync: async (query, storage) => {
      let timestamp = query.where.timestamp.min;

      while (timestamp <= query.where.timestamp.max) {
        const date = new Date(timestamp).toISOString().slice(0, 10);
        const response = await fetch(
          `https://data.binance.vision/data/spot/daily/aggTrades/${symbol.toUpperCase()}/${symbol.toUpperCase()}-aggTrades-${date}.zip`
        );

        for await (const row of Readable.fromWeb(response.body as any)
          .pipe(unzipper.ParseOne(/\.csv$/))
          .pipe(csv({ headers: false }))) {
          await storage.save([
            { timestamp: Math.floor(Number(row[5]) / 1000), payload: row }
          ]);
        }

        timestamp += DAY_MS;
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
