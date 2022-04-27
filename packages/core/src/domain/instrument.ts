import { timestamp } from '../shared';
import { Asset, AssetSelector } from './asset';
import { Commission } from './commission';
import { Component } from './component';

export class InstrumentSelector {
  private readonly id: string;

  readonly base: AssetSelector;
  readonly quote: AssetSelector;

  constructor(base: string, quote: string, adapter: string) {
    this.base = new AssetSelector(base.toLowerCase(), adapter.toLowerCase());
    this.quote = new AssetSelector(quote.toLowerCase(), adapter.toLowerCase());

    this.id = `${this.base.toString()}-${this.quote.name}`;
  }

  toString(): string {
    return this.id;
  }
}

/**
 * Represents trading market which is made up by two trading assets (base and quoted).
 */
export class Instrument extends InstrumentSelector implements Component {
  kind = 'instrument';
  timestamp: timestamp;
  commission: Commission;
  cross: Instrument;
  leverage?: number = null;

  constructor(readonly base: Asset, readonly quote: Asset, readonly raw: string) {
    super(base.name, quote.name, base.adapterName);

    if (base.adapterName != quote.adapterName) {
      throw new Error('Adapter mismatch!');
    }
  }
}

export function instrumentOf(instrument: string): InstrumentSelector {
  const section = instrument.split(':');
  const asset = section[1].split('-');

  return new InstrumentSelector(asset[0], asset[1], section[0]);
}
