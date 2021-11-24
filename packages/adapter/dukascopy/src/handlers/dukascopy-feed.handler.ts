import {
  Feed,
  Instrument,
  Timeframe,
  OrderbookPatchEvent,
  retry,
  AdapterFeedCommand,
  AdapterContext
} from '@quantform/core';
import { getHistoricRates, Instrument as DukascopyInstrument } from 'dukascopy-node';

export async function DukascopyFeedHandler(
  command: AdapterFeedCommand,
  context: AdapterContext
) {
  const instrument =
    context.store.snapshot.universe.instrument[command.instrument.toString()];

  const period = Timeframe.W1;
  const to = command.to;
  let from = command.from;

  while (from < to) {
    write(
      instrument,
      new Date(from),
      new Date(Math.min(from + period, to)),
      command.feed
    );

    from += period;

    command.progress(from);
  }
}

async function write(instrument: Instrument, from: Date, to: Date, feed: Feed) {
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
      await feed.save(instrument, batch);

      batch = [];
    }
  }

  await feed.save(instrument, batch);
}
