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
exports.Measurement = void 0;
/**
 *
 */
class Measurement {
    constructor(storage) {
        this.storage = storage;
    }
    /**
     *
     * @returns
     */
    index() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.storage.index()).map(it => Number(it));
        });
    }
    /**
     *
     * @param session
     * @param measurements
     * @returns
     */
    save(session, measurements) {
        return this.storage.save(session.toString(), measurements.map(it => ({
            timestamp: it.timestamp,
            kind: it.kind,
            json: JSON.stringify(it.payload)
        })));
    }
    /**
     *
     * @param session
     * @param options
     * @returns
     */
    query(session, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const rows = yield this.storage.query(session.toString(), options);
            return rows.map(it => ({
                timestamp: it.timestamp,
                kind: it.kind,
                payload: JSON.parse(it.json)
            }));
        });
    }
}
exports.Measurement = Measurement;
