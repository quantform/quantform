"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flatten = exports.positions = exports.position = void 0;
const rxjs_1 = require("rxjs");
const shared_1 = require("../shared");
const error_1 = require("./error");
const position_1 = require("./position");
function position(selector) {
    return (source) => source.pipe((0, rxjs_1.filter)(it => it instanceof position_1.Position && it.instrument.id == selector.id), (0, rxjs_1.map)(it => it));
}
exports.position = position;
function positions(selector, state) {
    const balance = state.balance.get(selector.quote.id);
    if (!balance) {
        throw (0, error_1.invalidInstrumentSelectorError)(selector.id);
    }
    const getter = () => Object.values(balance.position)
        .filter(it => it.instrument.id == selector.id)
        .map(it => it);
    return (source) => source.pipe(position(selector), (0, rxjs_1.map)(() => getter()), (0, rxjs_1.startWith)(getter()));
}
exports.positions = positions;
function flatten() {
    return function (source) {
        return source.pipe((0, rxjs_1.map)(it => {
            if (it.length > 1) {
                return {
                    size: it.reduce((aggregate, position) => aggregate.add(position.size), shared_1.d.Zero),
                    rate: (0, shared_1.weightedMean)(it.map(x => x.averageExecutionRate), it.map(x => x.size))
                };
            }
            if (it.length == 1) {
                return {
                    size: it[0].size,
                    rate: it[0].averageExecutionRate
                };
            }
            return {
                size: shared_1.d.Zero,
                rate: shared_1.d.Zero
            };
        }), (0, rxjs_1.share)());
    };
}
exports.flatten = flatten;
