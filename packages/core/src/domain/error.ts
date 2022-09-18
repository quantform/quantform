import { decimal } from '../shared';

export function insufficientFundsError(
  assetName: string,
  requiredAmount: decimal,
  availableAmount: decimal
) {
  return new Error(
    `insufficient funds of ${assetName} has: ${availableAmount.toString()} requires: ${requiredAmount.toString()}`
  );
}

export function invalidArgumentError(value: any) {
  return new Error(`invalid argument: ${value}`);
}

export function invalidAssetSelectorError(selector: string) {
  return new Error(`invalid asset selector: ${selector}`);
}

export function invalidInstrumentSelectorError(selector: string) {
  return new Error(`invalid instrument selector: ${selector}`);
}

export function adapterMismatchError() {
  return new Error('adapters must be the same');
}
