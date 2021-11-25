import {
  Asset,
  commissionPercentOf,
  AdapterContext,
  InstrumentPatchEvent,
  AdapterAwakeCommand
} from '@quantform/core';
import { Instrument as DukascopyInstrument } from 'dukascopy-node';
import { DukascopyAdapter } from '../';

/**
 *
 */
export function DukascopyAwakeHandler(
  command: AdapterAwakeCommand,
  context: AdapterContext,
  dukascopy: DukascopyAdapter
) {
  context.store.dispatch(
    ...Object.keys(DukascopyInstrument)
      .map(it => mapInstrument(it, context))
      .filter(it => it),
    new InstrumentPatchEvent(
      context.timestamp,
      new Asset('eur', 'dukascopy', 8),
      new Asset('chf', 'dukascopy', 8),
      commissionPercentOf(0.0, 0.0),
      'eurchf'
    )
  );
}

function mapInstrument(name: string, context: AdapterContext): InstrumentPatchEvent {
  for (const quote of this.quotes) {
    if (name.endsWith(quote)) {
      const base = name.substr(0, name.length - quote.length);

      return new InstrumentPatchEvent(
        context.timestamp,
        new Asset(base, 'dukascopy', 8),
        new Asset(quote, 'dukascopy', 8),
        commissionPercentOf(0.0, 0.0),
        name
      );
    }
  }
}
