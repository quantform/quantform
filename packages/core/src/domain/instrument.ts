import { timestamp } from '../shared';
import { Asset, AssetSelector, AssetSelectorSeparator } from './asset';
import { Commission } from './commission';
import { Component } from './component';
import { adapterMismatchError, invalidInstrumentSelectorError } from './error';

export const InstrumentSelectorSeparator = '-';

export class InstrumentSelector {
  readonly id: string;
  readonly base: AssetSelector;
  readonly quote: AssetSelector;

  constructor(base: string, quote: string, adapter: string) {
    this.base = new AssetSelector(base.toLowerCase(), adapter.toLowerCase());
    this.quote = new AssetSelector(quote.toLowerCase(), adapter.toLowerCase());

    this.id = `${this.base.id}${InstrumentSelectorSeparator}${this.quote.name}`;
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
      throw adapterMismatchError();
    }
  }
}

export function instrumentOf(selector: string): InstrumentSelector {
  const [adapterName, asset, ...rest] = selector.split(AssetSelectorSeparator);
  if (!adapterName || !asset || rest.length) {
    throw invalidInstrumentSelectorError(selector);
  }

  const [baseAssetName, quoteAssetName] = asset.split(InstrumentSelectorSeparator);
  if (!baseAssetName || !quoteAssetName) {
    throw invalidInstrumentSelectorError(selector);
  }

  return new InstrumentSelector(baseAssetName, quoteAssetName, adapterName);
}
