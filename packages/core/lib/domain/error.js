"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adapterMismatchError = exports.invalidInstrumentSelectorError = exports.invalidAssetSelectorError = exports.invalidArgumentError = exports.insufficientFundsError = void 0;
function insufficientFundsError(assetName, requiredAmount, availableAmount) {
    return new Error(`insufficient funds of ${assetName} has: ${availableAmount.toString()} requires: ${requiredAmount.toString()}`);
}
exports.insufficientFundsError = insufficientFundsError;
function invalidArgumentError(value) {
    return new Error(`invalid argument: ${value}`);
}
exports.invalidArgumentError = invalidArgumentError;
function invalidAssetSelectorError(selector) {
    return new Error(`invalid asset selector: ${selector}`);
}
exports.invalidAssetSelectorError = invalidAssetSelectorError;
function invalidInstrumentSelectorError(selector) {
    return new Error(`invalid instrument selector: ${selector}`);
}
exports.invalidInstrumentSelectorError = invalidInstrumentSelectorError;
function adapterMismatchError() {
    return new Error('adapters must be the same');
}
exports.adapterMismatchError = adapterMismatchError;
