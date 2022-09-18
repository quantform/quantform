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
const cli_progress_1 = require("cli-progress");
const rxjs_1 = require("rxjs");
const bootstrap_1 = require("../bootstrap");
const domain_1 = require("../domain");
const storage_1 = require("../storage");
const build_1 = __importDefault(require("./build"));
const error_1 = require("./error");
const workspace_1 = require("./internal/workspace");
function default_1(name, instrument, options) {
    return __awaiter(this, void 0, void 0, function* () {
        if (yield (0, build_1.default)()) {
            return;
        }
        const id = options.id ? Number(options.id) : undefined;
        const module = yield (0, workspace_1.getModule)(name);
        const bootstrap = new bootstrap_1.Bootstrap(module.descriptor);
        const session = bootstrap.useSessionId(id).paper();
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
        console.time('Pulling completed in');
        yield session.awake(() => (0, rxjs_1.of)());
        const bar = new cli_progress_1.SingleBar({
            format: `Pulling ${instrument} [{bar}] {percentage}% | ETA: {eta}s | {value}/{total}`
        }, cli_progress_1.Presets.rect);
        const feed = new storage_1.Feed(module.descriptor.storage('feed'));
        bar.start(100, 0);
        yield session.aggregate.feed((0, domain_1.instrumentOf)(instrument), from, to, (timestamp, events) => __awaiter(this, void 0, void 0, function* () {
            const duration = to - from;
            const completed = timestamp - from;
            yield feed.save(events);
            bar.update(Math.floor((completed / duration) * 100));
        }));
        bar.update(100);
        bar.stop();
        yield session.dispose();
        console.timeLog('Pulling completed in');
    });
}
exports.default = default_1;
