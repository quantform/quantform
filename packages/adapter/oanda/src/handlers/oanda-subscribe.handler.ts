import {
  AdapterContext,
  AdapterHandler,
  AdapterSubscribeRequest,
  InstrumentSelector,
  Logger,
  OrderbookPatchEvent,
  Store
} from '@quantform/core';
import { OandaAdapter } from '../oanda.adapter';

export class OandaSubscribeHandler
  implements AdapterHandler<AdapterSubscribeRequest, void> {
  constructor(private readonly oanda: OandaAdapter) {}

  async handle(
    request: AdapterSubscribeRequest,
    store: Store,
    context: AdapterContext
  ): Promise<void> {
    const instruments = [...request.instrument];

    for (const instrument of request.instrument) {
      if (this.oanda.asset.toString() != instrument.quote.toString()) {
        const left = new InstrumentSelector(
          this.oanda.asset.name,
          instrument.quote.name,
          context.name
        );
        const right = new InstrumentSelector(
          instrument.quote.name,
          this.oanda.asset.name,
          context.name
        );

        const cross = Object.values(store.snapshot.universe.instrument).find(
          it => it.toString() == left.toString() || it.toString() == right.toString()
        );

        instruments.push(cross);
      }
    }

    this.oanda.socket.pricing.stream(
      this.oanda.accountId,
      {
        instruments: instruments
          .filter(it => !this.oanda.subscription.contains(it))
          .map(it => it.raw)
          .join(','),
        snapshot: true
      },
      message => {
        if (message['type'] == 'PRICE') {
          const split = message['instrument'].split('_');
          const instrument = new InstrumentSelector(
            split[0].toLowerCase(),
            split[1].toLowerCase(),
            context.name
          );

          store.dispatch(
            new OrderbookPatchEvent(
              instrument,
              parseFloat(message['asks'][0]['price']),
              parseFloat(message['asks'][0]['liquidity']),
              parseFloat(message['bids'][0]['price']),
              parseFloat(message['bids'][0]['liquidity']),
              context.timestamp()
            )
          );
        }
      },
      () => {
        Logger.log('done');
      }
    );

    instruments.forEach(it => this.oanda.subscription.add(it));
  }
}
