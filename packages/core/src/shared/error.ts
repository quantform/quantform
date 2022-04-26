export function throwInsufficientFunds(requiredAmount: number, availableAmount: number) {
  throw new Error(`insufficient funds has: ${availableAmount} wants: ${requiredAmount}`);
}

export function throwInvalidAssetFormat(asset: string) {
  throw new Error(`invalid asset format: ${asset}`);
}
