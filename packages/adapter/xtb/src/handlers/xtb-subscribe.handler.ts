import { XtbAdapter } from '../xtb-adapter';
import { STREAMING_TICK_RECORD } from 'xapi-node';
import {
  AdapterContext,
  AdapterSubscribeCommand,
  OrderbookPatchEvent
} from '@quantform/core';

export async function XtbSubscribeHandler(
  command: AdapterSubscribeCommand,
  context: AdapterContext,
  xtb: XtbAdapter
) {
  if (!xtb.listener) {
    xtb.listener = xtb.endpoint.Stream.listen.getTickPrices(tick =>
      onUpdate(tick, context, xtb)
    );
  }

  for (const selector of command.instrument) {
    const instrument = context.store.snapshot.universe.instrument[selector.toString()];

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

  context.store.dispatch(
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
