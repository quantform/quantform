"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.backtestPageNotEmpty = exports.noPaperEngineProvidedError = exports.adapterNotFoundError = void 0;
function adapterNotFoundError(adapterName) {
    return new Error(`Unknown adapter: ${adapterName}. You should provide adapter in session descriptor.`);
}
exports.adapterNotFoundError = adapterNotFoundError;
function noPaperEngineProvidedError() {
    return new Error('No paper engine provided.');
}
exports.noPaperEngineProvidedError = noPaperEngineProvidedError;
function backtestPageNotEmpty() {
    return new Error('Backtest page is not empty');
}
exports.backtestPageNotEmpty = backtestPageNotEmpty;
