import { throwInvalidArgument, throwInvalidAssetSelector } from '../shared';
import { ceil, fixed, floor } from '../shared/decimals';

export const AssetSelectorSeparator = ':';

/**
 * Supposed to query specific @see Asset from based on string notation.
 */
export class AssetSelector {
  readonly id: string;
  readonly name: string;
  readonly adapterName: string;

  constructor(name: string, adapterName: string) {
    if (!name?.length) {
      throwInvalidArgument(name);
    }

    if (!adapterName?.length) {
      throwInvalidArgument(adapterName);
    }

    this.name = name.toLowerCase();
    this.adapterName = adapterName.toLowerCase();
    this.id = `${this.adapterName}${AssetSelectorSeparator}${this.name}`;
  }

  /**
   * Returns unified notation of the asset.
   */
  toString(): string {
    return this.id;
  }
}

/**
 * Creates @see AssetSelector based on unified string notation.
 */
export function assetOf(selector: string): AssetSelector {
  const [adapterName, name, ...rest] = selector.split(AssetSelectorSeparator);

  if (!adapterName || !name || rest.length) {
    throwInvalidAssetSelector(selector);
  }

  return new AssetSelector(name, adapterName);
}

/**
 * Represents a security that you can trade or hold in your wallet.
 * For example, you can combine two trading assets to create a trading instrument.
 */
export class Asset extends AssetSelector {
  readonly tickSize: number;

  constructor(name: string, adapterName: string, public readonly scale: number) {
    super(name, adapterName);

    if (!scale) {
      throwInvalidArgument(scale);
    }

    this.tickSize = 1.0 / Math.pow(10, this.scale);
  }

  /**
   * Trims a number to the asset precision.
   */
  fixed(number: number): number {
    return fixed(number, this.scale);
  }

  /**
   * Rounds down a number to the asset precision.
   */
  floor(number: number): number {
    return floor(number, this.scale);
  }

  /**
   * Rounds up a number to the asset precision.
   */
  ceil(number: number): number {
    return ceil(number, this.scale);
  }
}
