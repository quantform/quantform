"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.missingDescriptorParameterError = void 0;
function missingDescriptorParameterError(parameterName) {
    return new Error(`please set a "${parameterName}" date in session descriptor or provide the date as parameter.`);
}
exports.missingDescriptorParameterError = missingDescriptorParameterError;
