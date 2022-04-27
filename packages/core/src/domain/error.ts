export function throwInsufficientFunds(requiredAmount: number, availableAmount: number) {
  throw new Error(`insufficient funds has: ${availableAmount} wants: ${requiredAmount}`);
}

export function throwInvalidArgument(value: any) {
  throw new Error(`invalid argument: ${value}`);
}

export function throwInvalidAssetSelector(asset: string) {
  throw new Error(`invalid asset selector: ${asset}`);
}
