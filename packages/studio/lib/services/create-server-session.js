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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServerSession = exports.createServerSession = void 0;
var http_1 = require("http");
var next_1 = __importDefault(require("next"));
var url_1 = require("url");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
var globalAny = global;
function createServerSession(port, session) {
    return __awaiter(this, void 0, void 0, function () {
        var dev, hostname, dir, app, handle;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    dev = false;
                    hostname = 'localhost';
                    dir = '';
                    globalAny.session = session;
                    app = (0, next_1.default)({
                        dev: dev,
                        hostname: hostname,
                        port: port,
                        dir: dir
                    });
                    handle = app.getRequestHandler();
                    return [4 /*yield*/, app.prepare()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, http_1.createServer)(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                            var err_1;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!req.url) {
                                            throw new Error('missing url');
                                        }
                                        _a.label = 1;
                                    case 1:
                                        _a.trys.push([1, 3, , 4]);
                                        return [4 /*yield*/, handle(req, res, (0, url_1.parse)(req.url, true))];
                                    case 2:
                                        _a.sent();
                                        return [3 /*break*/, 4];
                                    case 3:
                                        err_1 = _a.sent();
                                        console.error('Error occurred handling', req.url, err_1);
                                        res.statusCode = 500;
                                        res.end('internal server error');
                                        return [3 /*break*/, 4];
                                    case 4: return [2 /*return*/];
                                }
                            });
                        }); }).listen(port, undefined, undefined, function () {
                            console.log('\x1b[36m%s\x1b[0m', 'info', " - Studio is ready on http://".concat(hostname, ":").concat(port));
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.createServerSession = createServerSession;
function getServerSession() {
    if (!globalAny.session) {
        throw new Error('Session is not defined');
    }
    return globalAny.session;
}
exports.getServerSession = getServerSession;
