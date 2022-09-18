"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setSession = exports.getSession = void 0;
var globalAny = global;
function getSession() {
    if (!globalAny.session) {
        throw new Error('Session is not defined');
    }
    return globalAny.session;
}
exports.getSession = getSession;
function setSession(session) {
    globalAny.session = session;
}
exports.setSession = setSession;
