"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.instrumentNotFoundError = void 0;
function instrumentNotFoundError(selector) {
    return new Error(`Instrument not found: ${selector.id}`);
}
exports.instrumentNotFoundError = instrumentNotFoundError;
