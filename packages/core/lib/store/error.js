"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderInvalidStateError = exports.balanceNotFoundError = exports.orderNotFoundError = exports.liquidationError = exports.instrumentNotSupportedError = exports.instrumentNotSubscribedError = exports.assetNotSupportedError = void 0;
function assetNotSupportedError(selector) {
    return new Error(`asset ${selector.id} not supported.`);
}
exports.assetNotSupportedError = assetNotSupportedError;
function instrumentNotSubscribedError(selector) {
    return new Error(`trying to patch a not subscribed instrument ${selector.id}`);
}
exports.instrumentNotSubscribedError = instrumentNotSubscribedError;
function instrumentNotSupportedError(selector) {
    return new Error(`instrument ${selector.id} not supported.`);
}
exports.instrumentNotSupportedError = instrumentNotSupportedError;
function liquidationError() {
    return new Error('you have been liquidated.');
}
exports.liquidationError = liquidationError;
function orderNotFoundError(id) {
    return new Error(`trying to patch unknown order: ${id}`);
}
exports.orderNotFoundError = orderNotFoundError;
function balanceNotFoundError(selector) {
    return new Error(`balance not found: ${selector.id}`);
}
exports.balanceNotFoundError = balanceNotFoundError;
function orderInvalidStateError(currentState, requiredStates) {
    return new Error(`order state ${currentState} is not in one of required states: ${requiredStates.join(', ')}`);
}
exports.orderInvalidStateError = orderInvalidStateError;
