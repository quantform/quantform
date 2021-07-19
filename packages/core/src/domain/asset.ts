import { ceil, fixed, floor } from '../common/decimals';

export class AssetSelector {
  private readonly id: string;

  readonly name: string;
  readonly exchange: string;

  constructor(name: string, exchange: string) {
    this.name = name.toLowerCase();
    this.exchange = exchange.toLowerCase();

    this.id = `${this.exchange}:${this.name}`;
  }

  toString(): string {
    return this.id;
  }
}

export class Asset extends AssetSelector {
  readonly tickSize: number;

  constructor(name: string, exchange: string, public readonly scale: number) {
    super(name, exchange);

    this.tickSize = 1.0 / Math.pow(10, this.scale);
  }

  fixed(number: number): number {
    return fixed(number, this.scale);
  }

  floor(number: number): number {
    return floor(number, this.scale);
  }

  ceil(number: number): number {
    return ceil(number, this.scale);
  }
}

export function assetOf(asset: string): AssetSelector {
  const section = asset.split(':');

  if (section.length != 2) {
    throw Error('invalid format');
  }

  const assetName = section[1];
  const exchangeName = section[0];

  if (assetName.length == 0 || exchangeName.length == 0) {
    throw Error('invalid format');
  }

  return new AssetSelector(assetName, exchangeName);
}
