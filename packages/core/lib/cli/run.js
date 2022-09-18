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
const build_1 = __importDefault(require("./build"));
const workspace_1 = require("./internal/workspace");
function default_1(name, options) {
    return __awaiter(this, void 0, void 0, function* () {
        if (yield (0, build_1.default)()) {
            return;
        }
        const id = options.id ? Number(options.id) : undefined;
        const module = yield (0, workspace_1.getModule)(name);
        const bootstrap = new bootstrap_1.Bootstrap(module.descriptor);
        const session = bootstrap.useSessionId(id).live();
        yield session.awake(module.default);
    });
}
exports.default = default_1;
