import {
  AdapterHandler,
  AdapterImportRequest,
  Feed,
  Instrument,
  Timeframe,
  OrderbookPatchEvent,
  retry,
  Store
} from '@quantform/core';
import { getHistoricRates, Instrument as DukascopyInstrument } from 'dukascopy-node';

export class ExchangeDukascopyImportHandler
  implements AdapterHandler<AdapterImportRequest, void> {
  async handle(request: AdapterImportRequest, store: Store): Promise<void> {
    const instrument = store.snapshot.universe.instrument[request.instrument.toString()];

    const period = Timeframe.W1;
    const to = request.to;
    let from = request.from;

    while (from < to) {
      this.import(
        instrument,
        new Date(from),
        new Date(Math.min(from + period, to)),
        request.feed
      );

      from += period;

      //ipcFeedNotify(request.from, request.to, from);
    }
  }

  private async import(instrument: Instrument, from: Date, to: Date, feed: Feed) {
    const serie = await retry<any>(() =>
      getHistoricRates({
        instrument: DukascopyInstrument[instrument.raw as keyof typeof Instrument],
        dates: {
          from: from.toISOString(),
          to: to.toISOString()
        },
        timeframe: 'tick',
        format: 'json'
      })
    );

    let iterator = 0;
    let batch = [];

    for (const ticker of serie) {
      batch.push(
        new OrderbookPatchEvent(
          instrument,
          ticker.askPrice,
          ticker.askVolume,
          ticker.bidPrice,
          ticker.bidVolume,
          ticker.timestamp
        )
      );

      iterator++;

      if (iterator % 1000 == 0) {
        await feed.write(instrument, batch);

        batch = [];
      }
    }

    await feed.write(instrument, batch);
  }
}
