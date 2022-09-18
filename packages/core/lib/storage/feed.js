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
exports.Feed = void 0;
const shared_1 = require("../shared");
const store_1 = require("../store");
/**
 * Represents a storage supposed to store historical data.
 * You can use CLI to fetch and save data in the Feed.
 */
class Feed {
    constructor(storage) {
        this.storage = storage;
    }
    /**
     * Returns all instrument names stored in the feed.
     */
    index() {
        return this.storage.index();
    }
    /**
     *
     * @param events
     * @returns
     */
    save(events) {
        return __awaiter(this, void 0, void 0, function* () {
            const grouped = events.reduce((aggregate, it) => {
                const document = this.serializeEvent(it);
                if (!document) {
                    return aggregate;
                }
                if (aggregate[it.instrument.id]) {
                    aggregate[it.instrument.id].push(document);
                }
                else {
                    aggregate[it.instrument.id] = [document];
                }
                return aggregate;
            }, {});
            for (const instrument in grouped) {
                yield this.storage.save(instrument, grouped[instrument]);
            }
        });
    }
    /**
     *
     * @param instrument
     * @param options
     * @returns
     */
    query(instrument, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const documents = yield this.storage.query(instrument.id, options);
            return documents.map(it => this.deserializeEvent(it, instrument));
        });
    }
    /**
     * Converts a StorageEvent to a persisted StorageDocument.
     */
    serializeEvent(event) {
        if (event instanceof store_1.OrderbookPatchEvent) {
            return {
                timestamp: event.timestamp,
                kind: 'orderbook',
                json: JSON.stringify({
                    ar: event.ask.rate.toString(),
                    ab: event.ask.quantity.toString(),
                    br: event.bid.rate.toString(),
                    bb: event.bid.quantity.toString()
                })
            };
        }
        if (event instanceof store_1.TradePatchEvent) {
            return {
                timestamp: event.timestamp,
                kind: 'trade',
                json: JSON.stringify({
                    r: event.rate.toString(),
                    q: event.quantity.toString()
                })
            };
        }
        return undefined;
    }
    /**
     * Converts a persisted StorageDocument to a StorageEvent.
     */
    deserializeEvent(document, instrument) {
        const payload = JSON.parse(document.json);
        if (document.kind === 'trade') {
            return new store_1.TradePatchEvent(instrument, (0, shared_1.d)(payload.r), (0, shared_1.d)(payload.q), document.timestamp);
        }
        if (document.kind === 'orderbook') {
            return new store_1.OrderbookPatchEvent(instrument, { rate: (0, shared_1.d)(payload.ar), quantity: (0, shared_1.d)(payload.aq), next: undefined }, { rate: (0, shared_1.d)(payload.bb), quantity: (0, shared_1.d)(payload.bq), next: undefined }, document.timestamp);
        }
        throw new Error(`Unsupported event: ${document.kind}`);
    }
}
exports.Feed = Feed;
