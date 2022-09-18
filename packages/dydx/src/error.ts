import { InstrumentSelector } from '@quantform/core';

export function instrumentNotFoundError(selector: InstrumentSelector) {
  return new Error(`Instrument not found: ${selector.id}`);
}
