import { XtbAdapter } from '../xtb-adapter';
import { STREAMING_TICK_RECORD } from 'xapi-node';
import { AdapterContext, InstrumentSelector, OrderbookPatchEvent } from '@quantform/core';

export async function XtbSubscribeHandler(
  instruments: InstrumentSelector[],
  context: AdapterContext,
  xtb: XtbAdapter
) {
  if (!xtb.listener) {
    xtb.listener = xtb.endpoint.Stream.listen.getTickPrices(tick =>
      onUpdate(tick, context, xtb)
    );
  }

  for (const selector of instruments) {
    const instrument = context.snapshot.universe.instrument[selector.toString()];

    xtb.mapper[instrument.raw] = instrument;

    await xtb.endpoint.Stream.subscribe.getTickPrices(instrument.raw).catch(() => {
      console.error('subscribe failed');
    });
  }
}

function onUpdate(
  tick: STREAMING_TICK_RECORD,
  context: AdapterContext,
  xtb: XtbAdapter
): void {
  if (tick.level != 0) {
    return;
  }

  const instrument = xtb.mapper[tick.symbol];

  context.dispatch(
    new OrderbookPatchEvent(
      instrument,
      tick.ask,
      tick.askVolume,
      tick.bid,
      tick.bidVolume,
      context.timestamp
    )
  );
}
