import { ceil, fixed, floor } from '../shared/decimals';

/**
 * Supposed to query specific @see Asset from based on string notation.
 */
export class AssetSelector {
  private readonly id: string;

  readonly name: string;
  readonly exchange: string;

  constructor(name: string, exchange: string) {
    this.name = name.toLowerCase();
    this.exchange = exchange.toLowerCase();

    this.id = `${this.exchange}:${this.name}`;
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
  const section = asset.split(':');

  if (section.length != 2) {
    throw Error('invalid asset format');
  }

  const assetName = section[1];
  const exchangeName = section[0];

  if (assetName.length == 0 || exchangeName.length == 0) {
    throw Error('invalid asset format');
  }

  return new AssetSelector(assetName, exchangeName);
}

/**
 * Represents a security that you can trade or hold in your wallet.
 * For example, you can combine two trading assets to create a trading instrument.
 */
export class Asset extends AssetSelector {
  readonly tickSize: number;

  constructor(name: string, exchange: string, public readonly scale: number) {
    super(name, exchange);

    this.tickSize = 1.0 / Math.pow(10, this.scale);
  }

  /**
   * Trims a number to the specified precision.
   */
  fixed(number: number): number {
    return fixed(number, this.scale);
  }

  /**
   * Rounds down a number to the specified precision.
   */
  floor(number: number): number {
    return floor(number, this.scale);
  }

  /**
   * Rounds up a number to the specified precision.
   */
  ceil(number: number): number {
    return ceil(number, this.scale);
  }
}
