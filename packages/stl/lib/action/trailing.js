"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trailingDown = exports.trailingUp = exports.Trailing = void 0;
const core_1 = require("@quantform/core");
const rxjs_1 = require("rxjs");
class Trailing {
    constructor(trigger, buffer) {
        this.trigger = trigger;
        this.buffer = buffer;
        this.triggered = false;
    }
    up(value) {
        if (value.greaterThanOrEqualTo(this.trigger)) {
            this.triggered = true;
        }
        if (this.triggered) {
            if (!this.max) {
                this.max = value;
            }
            else {
                this.max = core_1.decimal.max(this.max, value);
            }
        }
        if (this.triggered &&
            this.max &&
            value.lessThanOrEqualTo(this.max.minus(this.buffer))) {
            this.triggered = false;
            this.max = undefined;
            return true;
        }
        return false;
    }
    down(value) {
        if (value.lessThanOrEqualTo(this.trigger)) {
            this.triggered = true;
        }
        if (this.triggered) {
            if (!this.min) {
                this.min = value;
            }
            else {
                this.min = core_1.decimal.min(this.min, value);
            }
        }
        if (this.triggered &&
            this.min &&
            value.greaterThanOrEqualTo(this.min.plus(this.buffer))) {
            this.triggered = false;
            this.min = undefined;
            return true;
        }
        return false;
    }
}
exports.Trailing = Trailing;
function trailingUp(trigger, buffer, value) {
    return function (source) {
        const trailing = new Trailing(trigger, buffer);
        return source.pipe((0, rxjs_1.filter)(it => trailing.up(value(it))));
    };
}
exports.trailingUp = trailingUp;
function trailingDown(trigger, buffer, value) {
    return function (source) {
        const trailing = new Trailing(trigger, buffer);
        return source.pipe((0, rxjs_1.filter)(it => trailing.down(value(it))));
    };
}
exports.trailingDown = trailingDown;
