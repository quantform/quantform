"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriorityList = exports.Set = void 0;
class Set {
    constructor(values) {
        this.array = [];
        if (values) {
            values.forEach(it => this.upsert(it));
        }
    }
    get(id) {
        return this.array.find(it => it.id == id);
    }
    tryGetOrSet(id, setter) {
        var _a;
        return (_a = this.get(id)) !== null && _a !== void 0 ? _a : this.upsert(setter());
    }
    upsert(value) {
        const index = this.array.findIndex(it => it.id == value.id);
        if (index >= 0) {
            this.array[index] = value;
            return value;
        }
        this.array.push(value);
        return value;
    }
    remove(value) {
        const index = this.array.indexOf(value);
        if (index > -1) {
            this.array.splice(index, 1);
        }
    }
    asReadonlyArray() {
        return this.array;
    }
    clear() {
        this.array.splice(0, this.array.length);
    }
}
exports.Set = Set;
class PriorityList {
    constructor(comparer, getKeyFn) {
        this.comparer = comparer;
        this.getKeyFn = getKeyFn;
        this.valueByKey = {};
    }
    getByKey(key) {
        return this.valueByKey[key];
    }
    make(value, next = undefined) {
        const node = Object.assign(Object.assign({}, value), { next });
        this.valueByKey[this.getKeyFn(node)] = node;
        return node;
    }
    enqueue(value) {
        if (!this.head) {
            this.head = this.make(value);
        }
        if (this.comparer(this.head, value) > 0) {
            this.head = this.make(value, this.head);
        }
        else if (this.comparer(this.head, value) == 0) {
            this.head = this.make(value, this.head.next);
        }
        else {
            this.visit(it => {
                if (it.next) {
                    if (this.comparer(it.next, value) == 0) {
                        it.next = this.make(value, it.next.next);
                        return false;
                    }
                    if (this.comparer(it.next, value) > 0) {
                        it.next = this.make(value, it.next);
                        return false;
                    }
                    return true;
                }
                else {
                    it.next = this.make(value);
                    return false;
                }
            });
        }
    }
    dequeue(value) {
        if (!this.head) {
            return;
        }
        if (this.comparer(this.head, value) == 0) {
            this.head = this.head.next;
            delete this.valueByKey[this.getKeyFn(value)];
        }
        this.visit(it => {
            if (it.next && this.comparer(it.next, value) == 0) {
                it.next = it.next.next;
                delete this.valueByKey[this.getKeyFn(value)];
                return true;
            }
            return false;
        });
    }
    clear() {
        this.head = undefined;
        this.valueByKey = {};
    }
    visit(fn) {
        let top = this.head;
        while (top) {
            if (!fn(top)) {
                break;
            }
            top = top.next;
        }
    }
    reduce(fn, initValue) {
        this.visit(it => {
            initValue = fn(it, initValue);
            return true;
        });
        return initValue;
    }
}
exports.PriorityList = PriorityList;
