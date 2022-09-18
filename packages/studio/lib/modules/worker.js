"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Worker = void 0;
var stream_1 = require("stream");
var Worker = /** @class */ (function (_super) {
    __extends(Worker, _super);
    function Worker() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.queue = new Array();
        return _this;
    }
    Worker.prototype.enqueue = function (job) {
        this.queue.push(job);
        this.tryNext();
    };
    Worker.prototype.wait = function () {
        var _this = this;
        if (!this.queue.length) {
            return Promise.resolve();
        }
        return new Promise(function (resolve) {
            var listener = function () {
                if (_this.queue.length) {
                    return;
                }
                _this.removeListener('completed', listener);
                resolve();
            };
            _this.addListener('completed', listener);
        });
    };
    Worker.prototype.tryNext = function () {
        var _this = this;
        if (!this.queue.length) {
            return;
        }
        if (!this.promise) {
            var queued = this.queue[0];
            this.emit('started');
            this.promise = queued().finally(function () {
                _this.queue.shift();
                _this.promise = undefined;
                _this.emit('completed');
                _this.tryNext();
            });
        }
    };
    return Worker;
}(stream_1.EventEmitter));
exports.Worker = Worker;
