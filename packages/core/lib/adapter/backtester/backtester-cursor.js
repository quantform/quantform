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
exports.BacktesterCursor = void 0;
const error_1 = require("../error");
class BacktesterCursor {
    constructor(instrument, feed) {
        this.instrument = instrument;
        this.feed = feed;
        this.page = new Array();
        this.pageIndex = 0;
        this.completed = false;
    }
    get size() {
        return this.page.length - this.pageIndex;
    }
    peek() {
        if (!this.page) {
            return undefined;
        }
        return this.page[this.pageIndex];
    }
    dequeue() {
        return this.page[this.pageIndex++];
    }
    fetchNextPage(from, to) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.completed) {
                return;
            }
            if (this.size > 0) {
                throw (0, error_1.backtestPageNotEmpty)();
            }
            this.pageIndex = 0;
            this.page = yield this.feed.query(this.instrument, {
                from,
                to,
                count: 10000
            });
            this.completed = this.page.length == 0;
        });
    }
}
exports.BacktesterCursor = BacktesterCursor;
