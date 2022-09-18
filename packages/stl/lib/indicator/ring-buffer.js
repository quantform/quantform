"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RingBuffer = void 0;
class RingBuffer {
    constructor(capacity) {
        this.capacity = capacity;
        this.items = new Array(this.capacity);
        this.first = 0;
        this.last = 0;
        this.length = 0;
    }
    get size() {
        return this.length;
    }
    get isEmpty() {
        return this.size == 0;
    }
    get isFull() {
        return this.size == this.capacity;
    }
    peek() {
        return this.items[this.first];
    }
    dequeue() {
        const element = this.peek();
        this.length--;
        this.first = (this.first + 1) % this.capacity;
        return element;
    }
    enqueue(element) {
        this.last = (this.first + this.size) % this.capacity;
        const full = this.isFull;
        let removed = null;
        if (full) {
            removed = this.items[this.last];
        }
        this.items[this.last] = element;
        if (full) {
            this.first = (this.first + 1) % this.capacity;
        }
        else {
            this.length++;
        }
        return removed;
    }
    forEach(fn) {
        for (let i = 0; i < this.size; i++) {
            fn(this.at(i), i);
        }
    }
    at(index) {
        return this.items[(this.first + index) % this.capacity];
    }
}
exports.RingBuffer = RingBuffer;
