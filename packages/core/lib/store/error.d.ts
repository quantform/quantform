import { AssetSelector, InstrumentSelector, OrderState } from '../domain';
export declare function assetNotSupportedError(selector: AssetSelector): Error;
export declare function instrumentNotSubscribedError(selector: InstrumentSelector): Error;
export declare function instrumentNotSupportedError(selector: InstrumentSelector): Error;
export declare function liquidationError(): Error;
export declare function orderNotFoundError(id: string): Error;
export declare function balanceNotFoundError(selector: AssetSelector): Error;
export declare function orderInvalidStateError(currentState: OrderState, requiredStates: OrderState[]): Error;
//# sourceMappingURL=error.d.ts.map