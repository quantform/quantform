"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invalidEventSequenceError = exports.missingPeriodParametersError = void 0;
function missingPeriodParametersError() {
    return new Error('invalid backtest options, please provide from and to period.');
}
exports.missingPeriodParametersError = missingPeriodParametersError;
function invalidEventSequenceError() {
    return new Error('invalid event to consume');
}
exports.invalidEventSequenceError = invalidEventSequenceError;
