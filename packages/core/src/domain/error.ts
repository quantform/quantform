export function insufficientFundsError(
  assetName: string,
  requiredAmount: number,
  availableAmount: number
) {
  return new Error(
    `insufficient funds of ${assetName} has: ${availableAmount} requires: ${requiredAmount}`
  );
}

export function invalidArgumentError(value: any) {
  throw new Error(`invalid argument: ${value}`);
}

export function invalidAssetSelectorError(selector: string) {
  throw new Error(`invalid asset selector: ${selector}`);
}

export function invalidInstrumentSelectorError(selector: string) {
  throw new Error(`invalid instrument selector: ${selector}`);
}

export function adapterMismatchError() {
  return new Error('adapters must be the same');
}
