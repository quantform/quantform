import { decimal } from '../shared';
export declare function insufficientFundsError(assetName: string, requiredAmount: decimal, availableAmount: decimal): Error;
export declare function invalidArgumentError(value: any): Error;
export declare function invalidAssetSelectorError(selector: string): Error;
export declare function invalidInstrumentSelectorError(selector: string): Error;
export declare function adapterMismatchError(): Error;
//# sourceMappingURL=error.d.ts.map