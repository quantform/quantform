import { Store } from '../../store';
import { getHistoricRates, Instrument as DukascopyInstrument } from 'dukascopy-node';
import { ExchangeImportRequest } from '../../exchange-adapter/exchange-adapter-request';
import { ExchangeAdapterHandler } from '../../exchange-adapter';
import { Instrument, Timeframe } from '../../domain';
import { OrderbookPatchEvent } from '../../store/event';
import { Feed } from '../../feed';
import { retry } from '../../common/policy';
import { ipcFeedNotify } from '../../ipc';

export class ExchangeDukascopyImportHandler
  implements ExchangeAdapterHandler<ExchangeImportRequest, void> {
  async handle(request: ExchangeImportRequest, store: Store): Promise<void> {
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

      ipcFeedNotify(request.from, request.to, from);
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
