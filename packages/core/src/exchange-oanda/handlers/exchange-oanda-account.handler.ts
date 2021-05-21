import { Store } from '../../store';
import { BalancePatchEvent } from '../../store/event';
import { ExchangeAdapterContext, ExchangeAdapterHandler } from '../../exchange-adapter';
import { ExchangeAccountRequest } from '../../exchange-adapter/exchange-adapter-request';
import { ExchangeOandaAdapter } from '../exchange-oanda.adapter';
import { AssetSelector, Position } from '../../domain';

export class ExchangeOandaAccountHandler
  implements ExchangeAdapterHandler<ExchangeAccountRequest, void> {
  constructor(private readonly oanda: ExchangeOandaAdapter) {}

  async handle(
    request: ExchangeAccountRequest,
    store: Store,
    context: ExchangeAdapterContext
  ): Promise<void> {
    await this.fetchAccount(store, context);
  }

  private async fetchAccount(
    store: Store,
    context: ExchangeAdapterContext
  ): Promise<void> {
    const response = await new Promise<any>(resolve => {
      this.oanda.http.account.get(this.oanda.accountId, response =>
        resolve(response.body)
      );
    });

    const account = response.account;
    const cross = new AssetSelector(account.currency.toLowerCase(), context.name);

    store.dispatch(
      new BalancePatchEvent(
        cross,
        parseFloat(account.marginAvailable),
        0,
        context.timestamp()
      )
    );

    for (const payload of account.positions) {
      const instrument = Object.values(store.snapshot.universe.instrument).find(
        it => it.base.exchange == this.oanda.name && payload.instrument == it.raw
      );

      const long = payload.long;

      if (long && long.averagePrice) {
        const position = new Position(`${payload.instrument}-long`, instrument);

        position.averageExecutionRate = parseFloat(long.averagePrice);
        position.size = parseFloat(long.units);
        position.leverage = 10;
        position.mode = 'ISOLATED';
        position.estimatedUnrealizedPnL = parseFloat(long.unrealizedPL);

        //this.store.dispatch(new PositionLoadEvent(position, context.timestamp()));
      }

      const short = payload.short;

      if (short && short.averagePrice) {
        const position = new Position(`${payload.instrument}-short`, instrument);

        position.averageExecutionRate = parseFloat(short.averagePrice);
        position.size = parseFloat(short.units);
        position.leverage = 10;
        position.mode = 'ISOLATED';
        position.estimatedUnrealizedPnL = parseFloat(short.unrealizedPL);

        //this.store.dispatch(new PositionLoadEvent(position, context.timestamp()));
      }
    }
  }
}
