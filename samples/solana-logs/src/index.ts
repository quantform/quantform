import { combineLatest, from, tap } from 'rxjs';

import {
  app,
  replayOptions,
  uri,
  useLogger,
  useReplay,
  useReplayStorage,
  useSimulator
} from '@quantform/core';
import { pumpFun, usePumpFun } from '@quantform/pump-fun';
import { Commitment, solana, SolanaOptions } from '@quantform/solana';
import { sqlite } from '@quantform/sqlite';

const data = [{ timestamp: 0, payload: { value: 1 } }];

function watchMarketData() {
  const { watch } = useReplayStorage(uri(`polymarket://data-1`, {}), {
    async sync(query, storage) {
      console.log('FETCHING 1');

      await storage.save([
        { timestamp: 1, payload: { value: 1 } },
        { timestamp: 2, payload: { value: 1 } },
        { timestamp: 3, payload: { value: 1 } },
        { timestamp: 4, payload: { value: 1 } }
      ]);
    }
  });

  return useReplay(watch(), from(data));
}

function watchMarketData2() {
  const { watch } = useReplayStorage(uri(`polymarket://data-2`, {}), {
    async sync(query, storage) {
      console.log('FETCHING 2');

      await storage.save([
        { timestamp: 1, payload: { value: 2 } },
        { timestamp: 2, payload: { value: 2 } },
        { timestamp: 3, payload: { value: 2 } },
        { timestamp: 4, payload: { value: 2 } }
      ]);
    }
  });

  return useReplay(watch(), from(data));
}

export default app()
  .use(sqlite())
  .use(replayOptions({ from: 0, to: 100, storage: 'test' }))
  .start(() =>
    combineLatest([watchMarketData(), watchMarketData2()]).pipe(
      tap(it => console.log(it))
    )
  );
