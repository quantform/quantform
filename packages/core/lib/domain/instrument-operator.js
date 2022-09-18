"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.instruments = exports.instrument = void 0;
const rxjs_1 = require("rxjs");
const instrument_1 = require("./instrument");
function instrument(selector, state) {
    return (source$) => source$.pipe((0, rxjs_1.startWith)(state.universe.instrument.get(selector.id)), (0, rxjs_1.filter)(it => it instanceof instrument_1.Instrument && it.id == selector.id), (0, rxjs_1.map)(it => it));
}
exports.instrument = instrument;
function instruments(state) {
    return (source$) => source$.pipe((0, rxjs_1.filter)(it => it instanceof instrument_1.Instrument), (0, rxjs_1.map)(() => state.universe.instrument.asReadonlyArray()), (0, rxjs_1.startWith)(state.universe.instrument.asReadonlyArray()), (0, rxjs_1.filter)(it => it.length > 0), (0, rxjs_1.distinctUntilChanged)((lhs, rhs) => lhs.length == rhs.length));
}
exports.instruments = instruments;
