import { binance } from '@quantform/binance';
import { instrumentOf, Session, SessionDescriptor } from '@quantform/core';
import { sqlite } from '@quantform/sqlite';
import { study } from '@quantform/studio';

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

export default study(4000, (session: Session) =>
  session.orderbook(instrumentOf('binance:btc-busd'))
);
