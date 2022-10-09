import { binance } from '@quantform/binance';
import { instrumentOf, Session, SessionDescriptor } from '@quantform/core';
import { sqlite } from '@quantform/sqlite';
import { study } from '@quantform/studio';
import { linear } from '@quantform/studio/src/components/charting';
import { tap } from 'rxjs';

export function getSessionDescriptor(): SessionDescriptor {
  return {
    adapter: [binance()],
    storage: sqlite(),
    simulation: {
      balance: {
        'binance:btc': 1,
        'binance:usdt': 1000
      },
      from: 0,
      to: 0
    }
  };
}

const tradeMeasure = linear({
  kind: 'test',
  title: 'Test'
});

export default study(4000, (session: StudySession) => {
  const [, measure] = session.measure({ kind: 'trade' });

  return session.trade(instrumentOf('binance:btc-busd')).pipe(
    tap(it =>
      measure({
        timestamp: it.timestamp,
        rate: it.rate
      })
    )
  );
});
