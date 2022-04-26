import { throwInvalidAssetFormat } from '../shared';
import { ceil, fixed, floor } from '../shared/decimals';

export const AssetSelectorSeparator = ':';

/**
 * Supposed to query specific @see Asset from based on string notation.
 */
export class AssetSelector {
  readonly id: string;
  readonly name: string;
  readonly adapter: string;

  constructor(name: string, adapter: string) {
    this.name = name.toLowerCase();
    this.adapter = adapter.toLowerCase();
    this.id = `${this.adapter}${AssetSelectorSeparator}${this.name}`;
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
export function assetOf(asset: string): AssetSelector {
  const values = asset.split(AssetSelectorSeparator);

  if (values.length != 2) {
    throwInvalidAssetFormat(asset);
  }

  const assetName = values[1];
  const adapterName = values[0];

  if (assetName.length == 0 || adapterName.length == 0) {
    throwInvalidAssetFormat(asset);
  }

  return new AssetSelector(assetName, adapterName);
}

/**
 * Represents a security that you can trade or hold in your wallet.
 * For example, you can combine two trading assets to create a trading instrument.
 */
export class Asset extends AssetSelector {
  readonly tickSize: number;

  constructor(name: string, adapter: string, public readonly scale: number) {
    super(name, adapter);

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
