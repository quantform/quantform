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
exports.InMemoryStorage = exports.inMemoryStorageFactory = void 0;
function inMemoryStorageFactory() {
    const storage = {};
    return (type) => { var _a; return (_a = storage[type]) !== null && _a !== void 0 ? _a : (storage[type] = new InMemoryStorage()); };
}
exports.inMemoryStorageFactory = inMemoryStorageFactory;
/**
 *
 */
class InMemoryStorage {
    constructor() {
        this.tables = {};
    }
    /**
     *
     * @returns
     */
    index() {
        return __awaiter(this, void 0, void 0, function* () {
            return Object.keys(this.tables);
        });
    }
    /**
     *
     * @param library
     * @param options
     * @returns
     */
    query(library, options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.tables[library]) {
                return [];
            }
            let query = this.tables[library];
            const { from, to, kind, count } = options;
            if (from) {
                query = query.filter(it => it.timestamp > from);
            }
            if (to) {
                query = query.filter(it => it.timestamp < to);
            }
            if (kind) {
                query = query.filter(it => it.kind == kind);
            }
            if (from == undefined && to) {
                query = query.reverse();
            }
            if (count) {
                query = query.slice(0, options.count);
            }
            return query;
        });
    }
    /**
     *
     * @param library
     * @param documents
     */
    save(library, documents) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.tables[library]) {
                this.tables[library] = [];
            }
            const buffer = this.tables[library];
            for (const document of documents) {
                buffer.push(document);
            }
            buffer.sort((lhs, rhs) => lhs.timestamp - rhs.timestamp);
        });
    }
    /**
     *
     */
    clear() {
        this.tables = {};
    }
}
exports.InMemoryStorage = InMemoryStorage;
