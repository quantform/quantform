import {
  Asset,
  commisionPercentOf,
  AdapterContext,
  AdapterHandler,
  AdapterAwakeRequest,
  InstrumentPatchEvent,
  Store
} from '@quantform/core';
import { Instrument as DukascopyInstrument } from 'dukascopy-node';
/**
 *
 */
export class ExchangeDukascopyAwakeHandler
  implements AdapterHandler<AdapterAwakeRequest, void> {
  private readonly quotes = ['usd', 'eur'];

  async handle(
    request: AdapterAwakeRequest,
    store: Store,
    context: AdapterContext
  ): Promise<void> {
    store.dispatch(
      ...Object.keys(DukascopyInstrument)
        .map(it => this.mapInstrument(it, context))
        .filter(it => it),
      new InstrumentPatchEvent(
        context.timestamp(),
        new Asset('eur', 'dukascopy', 8),
        new Asset('chf', 'dukascopy', 8),
        commisionPercentOf(0.0, 0.0),
        'eurchf'
      )
    );
  }

  private mapInstrument(name: string, context: AdapterContext): InstrumentPatchEvent {
    for (const quote of this.quotes) {
      if (name.endsWith(quote)) {
        const base = name.substr(0, name.length - quote.length);

        return new InstrumentPatchEvent(
          context.timestamp(),
          new Asset(base, 'dukascopy', 8),
          new Asset(quote, 'dukascopy', 8),
          commisionPercentOf(0.0, 0.0),
          name
        );
      }
    }
  }
}
