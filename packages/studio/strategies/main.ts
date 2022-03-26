import { BinanceAdapter } from '@quantform/binance';
import { instrumentOf } from '@quantform/core';
import { tap } from 'rxjs';

import { studio } from '..';

export const descriptor = {
  adapter: [new BinanceAdapter()]
};

export default studio(3000, session =>
  session
    .orderbook(instrumentOf('binance:btc-usdt'))
    .pipe(tap(it => console.log(it.bestAskQuantity)))
);
