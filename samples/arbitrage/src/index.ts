import { binance } from '@quantform/binance';
import { candle, instrumentOf, SessionDescriptor, Timeframe } from '@quantform/core';
import { sqlite } from '@quantform/sqlite';
import {
  candlestick,
  layout,
  pane,
  study,
  StudySession,
  StudySessionOptions
} from '@quantform/studio';
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

const s: StudySessionOptions = {
  port: 4000,
  ...layout({
    children: [
      pane({
        children: [
          candlestick({
            kind: 'test',
            map: x => ({ ...x }),
            scale: 8
          })
        ]
      })
    ]
  })
};

export default study(s, (session: StudySession) => {
  const [, measure] = session.useMeasure({ kind: 'test' });

  return session.trade(instrumentOf('binance:btc-busd')).pipe(
    candle(Timeframe.M1, it => it.rate),
    tap(it => measure(it))
  );
});
