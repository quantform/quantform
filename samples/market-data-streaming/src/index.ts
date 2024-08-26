import * as dotenv from 'dotenv';
import { catchError, map, of, tap, zip } from 'rxjs';

import { binance, useBinance } from '@quantform/binance';
import {
  after,
  assetOf,
  before,
  behavior,
  Commission,
  d,
  instrumentOf,
  strategy,
  useLogger
} from '@quantform/core';
import { sqlite } from '@quantform/sqlite';
import { uniswap, useUniswap } from '@quantform/uniswap';

import { whenTradeVolumeAccumulated } from './when-trade-volume-accumulated';

export default strategy(() => {
  dotenv.config();

  behavior(() => {
    const { whenSwap } = useUniswap();
    const { info } = useLogger('market-data-streaming');

    return whenSwap(instrumentOf('uniswap:usdc-usdt')).pipe(
      tap(it => info(it[0])),
      catchError(err => {
        console.log(err);

        return of('');
      })
    );
  });
  /*
  behavior(() => {
    const { info } = useLogger('market-data-streaming');

    return zip([
      whenTradeVolumeAccumulated(instrumentOf('binance:btc-usdt')),
      whenTradeVolumeAccumulated(instrumentOf('binance:eth-usdt'))
    ]).pipe(tap(([btc, eth]) => info(`accumulated volume: ${btc} BTC, ${eth} ETH`)));
  });
*/
  after(() => {
    const { withSimulator } = useBinance();

    return withSimulator().pipe(map(it => console.log(it.snapshot().ticks)));
  });

  return [
    ...binance({
      simulator: {
        commission: Commission.Zero,
        balance: {
          ['usdt']: { free: d(1000) }
        }
      }
    }),
    ...uniswap({
      rpc: {
        wss: 'wss://mainnet.infura.io/ws/v3/2e5b11fd82c843e0acd1109d3b55db60'
      },
      token: {
        query: () =>
          Promise.resolve([
            {
              symbol: 'USDC',
              decimals: 6,
              address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
            },
            {
              symbol: 'USDT',
              decimals: 6,
              address: '0xdAC17F958D2ee523a2206206994597C13D831ec7'
            }
          ])
      }
    }),
    sqlite()
  ];
});
