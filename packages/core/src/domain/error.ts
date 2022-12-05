import { decimal } from '@lib/shared';

export class InsufficientFundsError extends Error {
  constructor(assetName: string, requiredAmount: decimal, availableAmount: decimal) {
    super(
      `insufficient funds of ${assetName} has: ${availableAmount.toString()} requires: ${requiredAmount.toString()}`
    );
  }
}

export class InvalidArgumentsError extends Error {
  constructor(argName: Record<any, unknown>) {
    super(`invalid arguments: ${argName}`);
  }
}

export class InvalidAssetSelectorError extends Error {
  constructor(selector: string) {
    super(`invalid asset selector: ${selector}`);
  }
}
export class InvalidInstrumentSelectorError extends Error {
  constructor(selector: string) {
    super(`invalid instrument selector: ${selector}`);
  }
}

export class AdapterMismatchError extends Error {
  constructor() {
    super('adapters must be the same');
  }
}
