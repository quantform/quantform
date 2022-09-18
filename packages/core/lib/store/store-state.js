"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.State = exports.InnerSet = void 0;
const shared_1 = require("../shared");
class InnerSet extends shared_1.Set {
    constructor(id, values) {
        super(values);
        this.id = id;
    }
}
exports.InnerSet = InnerSet;
class State {
    constructor() {
        this.timestamp = 0;
        this.universe = {
            asset: new shared_1.Set(),
            instrument: new shared_1.Set()
        };
        this.subscription = {
            asset: new shared_1.Set(),
            instrument: new shared_1.Set()
        };
        this.trade = new shared_1.Set();
        this.orderbook = new shared_1.Set();
        this.balance = new shared_1.Set();
        this.order = new shared_1.Set();
    }
}
exports.State = State;
