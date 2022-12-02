import { Component, Instrument } from '@lib/domain';
import { decimal } from '@lib/shared';

/**
 * Simple trade or ticker executed on the market, it's a match of buyer
 * and seller of the same asset.
 */
export class Trade implements Component {
  readonly id: string;

  constructor(
    public timestamp: number,
    public readonly instrument: Instrument,
    public rate: decimal,
    public quantity: decimal
  ) {
    this.id = instrument.id;
  }
}
