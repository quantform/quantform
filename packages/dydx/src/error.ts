import { InstrumentSelector } from '@quantform/core';

export class InstrumentNotFoundError extends Error {
  constructor(selector: InstrumentSelector) {
    super(`Instrument not found: ${selector.id}`);
  }
}
