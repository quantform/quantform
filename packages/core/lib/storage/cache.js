"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cache = void 0;
const shared_1 = require("../shared");
class Cache {
    constructor(storage) {
        this.storage = storage;
    }
    tryGet(getter, options) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const time = (0, shared_1.now)();
            const payload = yield this.storage.query(options.key, {
                kind: 'cache',
                count: 1,
                to: time + 1
            });
            const ttl = (_a = options.ttl) !== null && _a !== void 0 ? _a : 60 * 60 * 24;
            if (!payload.length || payload[0].timestamp < time - ttl) {
                const value = yield getter();
                yield this.storage.save(options.key, [
                    {
                        timestamp: time,
                        kind: 'cache',
                        json: JSON.stringify(value)
                    }
                ]);
                return value;
            }
            return JSON.parse(payload[0].json);
        });
    }
}
exports.Cache = Cache;
