"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commissionPercentOf = exports.Commission = void 0;
const shared_1 = require("../shared");
class Commission {
    constructor(makerRate, takerRate) {
        this.makerRate = makerRate;
        this.takerRate = takerRate;
    }
    calculateMakerFee(value) {
        return value.mul(this.makerRate);
    }
    calculateTakerFee(value) {
        return value.mul(this.takerRate);
    }
    applyMakerFee(value) {
        return value.minus(this.calculateMakerFee(value));
    }
    applyTakerFee(value) {
        return value.minus(this.calculateTakerFee(value));
    }
}
exports.Commission = Commission;
Commission.Zero = commissionPercentOf({ maker: shared_1.d.Zero, taker: shared_1.d.Zero });
function commissionPercentOf(fees) {
    return new Commission(fees.maker.div(100.0), fees.taker.div(100.0));
}
exports.commissionPercentOf = commissionPercentOf;
