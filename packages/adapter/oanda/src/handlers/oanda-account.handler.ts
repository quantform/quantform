import {
  AssetSelector,
  BalancePatchEvent,
  AdapterContext,
  Position
} from '@quantform/core';
import { OandaAdapter } from '../oanda.adapter';

export async function OandaAccountHandler(
  context: AdapterContext,
  oanda: OandaAdapter
): Promise<void> {
  const response = await new Promise<any>(resolve => {
    oanda.http.account.get(oanda.accountId, response => resolve(response.body));
  });

  const account = response.account;
  const cross = new AssetSelector(account.currency.toLowerCase(), oanda.name);

  context.dispatch(
    new BalancePatchEvent(
      cross,
      parseFloat(account.marginAvailable),
      0,
      context.timestamp
    )
  );

  for (const payload of account.positions) {
    const instrument = Object.values(context.snapshot.universe.instrument).find(
      it => it.base.adapter == oanda.name && payload.instrument == it.raw
    );

    const long = payload.long;

    if (long && long.averagePrice) {
      const position = new Position(`${payload.instrument}-long`, instrument);

      position.averageExecutionRate = parseFloat(long.averagePrice);
      position.size = parseFloat(long.units);
      position.leverage = 10;
      position.mode = 'ISOLATED';
      position.estimatedUnrealizedPnL = parseFloat(long.unrealizedPL);

      //context.store.dispatch(new PositionLoadEvent(position, context.timestamp()));
    }

    const short = payload.short;

    if (short && short.averagePrice) {
      const position = new Position(`${payload.instrument}-short`, instrument);

      position.averageExecutionRate = parseFloat(short.averagePrice);
      position.size = parseFloat(short.units);
      position.leverage = 10;
      position.mode = 'ISOLATED';
      position.estimatedUnrealizedPnL = parseFloat(short.unrealizedPL);

      //context.store.dispatch(new PositionLoadEvent(position, context.timestamp()));
    }
  }
}
