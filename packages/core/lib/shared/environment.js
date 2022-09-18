"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnvVar = exports.workingDirectory = void 0;
function workingDirectory() {
    return './.quantform/';
}
exports.workingDirectory = workingDirectory;
function getEnvVar(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing environment variable: ${name}`);
    }
    return value;
}
exports.getEnvVar = getEnvVar;
