import { firstValueFrom } from 'rxjs';

import { instrumentOf, InstrumentSelector, Module } from '@quantform/core';

import { BinanceConnector } from '@lib/binance-connector';
import { useBinanceOrderbook } from '@lib/use-binance-orderbook';

describe(useBinanceOrderbook.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('initialize connector when requested', async () => {
    const [btc_usdt, eth_usdt, btc_usdt_replay] = await Promise.all([
      fixtures.whenRequested(instrumentOf('binance:btc-usdt')),
      fixtures.whenRequested(instrumentOf('binance:eth-usdt')),
      fixtures.whenRequested(instrumentOf('binance:btc-usdt'))
    ]);

    console.log(btc_usdt);
    console.log(eth_usdt);

    expect(btc_usdt).toEqual(btc_usdt_replay);
  });
});

async function getFixtures() {
  const module = new Module({
    dependencies: [{ provide: BinanceConnector, useClass: BinanceConnector }]
  });

  await module.awake();

  return {
    whenRequested: async (instrument: InstrumentSelector) =>
      await module.executeUsingModule(
        async () => await firstValueFrom(useBinanceOrderbook(instrument))
      )
  };
}
