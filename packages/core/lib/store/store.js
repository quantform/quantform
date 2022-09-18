"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Store = void 0;
const rxjs_1 = require("rxjs");
const store_state_1 = require("./store-state");
class Store {
    constructor() {
        this.pendingChanges = new Array();
        this.changes = new rxjs_1.Subject();
        this.snapshot = new store_state_1.State();
    }
    get changes$() {
        return this.changes.asObservable();
    }
    dispatch(...events) {
        for (const event of events) {
            event.handle(this.snapshot, this);
        }
        this.commitPendingChanges();
    }
    commit(component) {
        this.pendingChanges.push(component);
    }
    commitPendingChanges() {
        this.pendingChanges.forEach(it => this.changes.next(it));
        this.pendingChanges.splice(0, this.pendingChanges.length);
    }
    dispose() {
        this.changes.complete();
    }
}
exports.Store = Store;
