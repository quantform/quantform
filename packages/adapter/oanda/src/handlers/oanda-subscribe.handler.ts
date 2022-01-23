import {
  AdapterContext,
  InstrumentSelector,
  Logger,
  OrderbookPatchEvent
} from '@quantform/core';
import { OandaAdapter } from '../oanda.adapter';

export async function OandaSubscribeHandler(
  instruments2: InstrumentSelector[],
  context: AdapterContext,
  oanda: OandaAdapter
): Promise<void> {
  const instruments = instruments2.map(
    it => context.snapshot.universe.instrument[it.toString()]
  );

  for (const instrument of instruments2) {
    if (oanda.asset.toString() != instrument.quote.toString()) {
      const left = new InstrumentSelector(
        oanda.asset.name,
        instrument.quote.name,
        oanda.name
      );
      const right = new InstrumentSelector(
        instrument.quote.name,
        oanda.asset.name,
        oanda.name
      );

      const cross = Object.values(context.snapshot.universe.instrument).find(
        it => it.toString() == left.toString() || it.toString() == right.toString()
      );

      instruments.push(cross);
    }
  }

  oanda.socket.pricing.stream(
    oanda.accountId,
    {
      instruments: instruments
        .filter(it => !oanda.subscription.contains(it))
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
          oanda.name
        );

        context.dispatch(
          new OrderbookPatchEvent(
            instrument,
            parseFloat(message['asks'][0]['price']),
            parseFloat(message['asks'][0]['liquidity']),
            parseFloat(message['bids'][0]['price']),
            parseFloat(message['bids'][0]['liquidity']),
            context.timestamp
          )
        );
      }
    },
    () => {
      Logger.log('done');
    }
  );

  instruments.forEach(it => oanda.subscription.add(it));
}
