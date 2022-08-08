import Decimal from 'decimal.js';

import { decimal } from './../shared/decimals';
import { invalidArgumentError, invalidAssetSelectorError } from './error';

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
      throw invalidArgumentError(name);
    }

    if (!adapterName?.length) {
      throw invalidArgumentError(adapterName);
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
    throw invalidAssetSelectorError(selector);
  }

  return new AssetSelector(name, adapterName);
}

/**
 * Represents a security that you can trade or hold in your wallet.
 * For example, you can combine two trading assets to create a trading instrument.
 */
export class Asset extends AssetSelector {
  readonly tickSize: decimal;

  constructor(name: string, adapterName: string, public readonly scale: number) {
    super(name, adapterName);

    if (scale && (scale < 0 || Number.isNaN(scale))) {
      throw invalidArgumentError(scale);
    }

    this.tickSize = new decimal(1.0).div(Math.pow(10, this.scale));
  }

  /**
   * Rounds down a number to the asset precision.
   */
  floor(number: decimal): decimal {
    return number.toFloor(this.scale);
  }

  /**
   * Rounds up a number to the asset precision.
   */
  ceil(number: decimal): decimal {
    return number.toCeil(this.scale);
  }
}
