import {
  AdapterMismatchError,
  Asset,
  AssetSelector,
  AssetSelectorSeparator,
  Commission,
  Component,
  InvalidInstrumentSelectorError
} from '@lib/domain';

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
}

/**
 * Represents trading market which is made up by two trading assets (base and quoted).
 */
export class Instrument extends InstrumentSelector implements Component {
  readonly cross: Instrument | undefined;
  leverage: number | undefined = undefined;

  constructor(
    public timestamp: number,
    override readonly base: Asset,
    override readonly quote: Asset,
    readonly raw: string,
    public commission: Commission
  ) {
    super(base.name, quote.name, base.adapterName);

    if (base.adapterName != quote.adapterName) {
      throw new AdapterMismatchError();
    }
  }
}

export function instrumentOf(selector: string): InstrumentSelector {
  const [adapterName, asset, ...rest] = selector.split(AssetSelectorSeparator);
  if (!adapterName || !asset || rest.length) {
    throw new InvalidInstrumentSelectorError(selector);
  }

  const [baseAssetName, quoteAssetName] = asset.split(InstrumentSelectorSeparator);
  if (!baseAssetName || !quoteAssetName) {
    throw new InvalidInstrumentSelectorError(selector);
  }

  return new InstrumentSelector(baseAssetName, quoteAssetName, adapterName);
}
