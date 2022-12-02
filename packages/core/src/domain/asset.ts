import { InvalidArgumentsError, InvalidAssetSelectorError } from '@lib/domain';
import { d, decimal } from '@lib/shared';

export const AssetSelectorSeparator = ':';

/**
 * Supposed to query specific @see Asset based on string notation.
 */
export class AssetSelector {
  readonly id: string;
  readonly name: string;
  readonly adapterName: string;

  constructor(name: string, adapterName: string) {
    if (!name?.length) {
      throw new InvalidArgumentsError({ name });
    }

    if (!adapterName?.length) {
      throw new InvalidArgumentsError({ adapterName });
    }

    this.name = name.toLowerCase();
    this.adapterName = adapterName.toLowerCase();
    this.id = `${this.adapterName}${AssetSelectorSeparator}${this.name}`;
  }
}

/**
 * Creates @see AssetSelector based on unified string notation.
 */
export function assetOf(selector: string): AssetSelector {
  const [adapterName, name, ...rest] = selector.split(AssetSelectorSeparator);

  if (!adapterName || !name || rest.length) {
    throw new InvalidAssetSelectorError(selector);
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
      throw new InvalidArgumentsError({ scale });
    }

    this.tickSize = d(1.0).div(Math.pow(10, this.scale));
  }

  /**
   * Formats a number to string with fixed number of decimal places.
   */
  fixed(number: decimal): string {
    return number.toFixed(this.scale);
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
