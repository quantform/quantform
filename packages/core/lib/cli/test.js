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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bootstrap_1 = require("../bootstrap");
const shared_1 = require("../shared");
const build_1 = __importDefault(require("./build"));
const error_1 = require("./error");
const workspace_1 = require("./internal/workspace");
function default_1(name, options) {
    return __awaiter(this, void 0, void 0, function* () {
        if (yield (0, build_1.default)()) {
            return;
        }
        const module = yield (0, workspace_1.getModule)(name);
        const bootstrap = new bootstrap_1.Bootstrap(module.descriptor);
        if (!module.descriptor.storage) {
            throw (0, error_1.missingDescriptorParameterError)('storage');
        }
        if (!module.descriptor.simulation) {
            throw (0, error_1.missingDescriptorParameterError)('simulation');
        }
        const from = options.from
            ? Date.parse(options.from)
            : module.descriptor.simulation.from;
        if (!from) {
            throw (0, error_1.missingDescriptorParameterError)('from');
        }
        const to = options.to ? Date.parse(options.to) : module.descriptor.simulation.to;
        if (!to) {
            throw (0, error_1.missingDescriptorParameterError)('to');
        }
        const startTime = performance.now();
        yield new Promise(resolve => {
            const [session] = bootstrap.useBacktestPeriod(from, to).backtest({
                onBacktestStarted: () => { var _a; return shared_1.Logger.info('backtest', `new session ${(_a = session.descriptor) === null || _a === void 0 ? void 0 : _a.id} started`); },
                onBacktestCompleted: () => __awaiter(this, void 0, void 0, function* () {
                    var _a;
                    yield session.dispose();
                    const seconds = ((performance.now() - startTime) / 1000).toFixed(3);
                    shared_1.Logger.info('backtest', `session ${(_a = session.descriptor) === null || _a === void 0 ? void 0 : _a.id} completed in ${seconds}s`);
                    resolve();
                })
            });
            session.awake(module.default);
        });
    });
}
exports.default = default_1;
