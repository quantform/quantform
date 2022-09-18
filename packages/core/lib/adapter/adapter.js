"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Adapter = exports.DefaultTimeProvider = void 0;
const shared_1 = require("../shared");
exports.DefaultTimeProvider = {
    timestamp: () => (0, shared_1.now)()
};
/**
 * Base adapter class, you should derive your own adapter from this class.
 * @abstract
 */
class Adapter {
    constructor(timeProvider) {
        this.timeProvider = timeProvider;
    }
    timestamp() {
        return this.timeProvider.timestamp();
    }
}
exports.Adapter = Adapter;
