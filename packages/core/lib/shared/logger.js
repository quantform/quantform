"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const chalk = __importStar(require("chalk"));
const datetime_1 = require("./datetime");
const colorize = (content) => {
    let hash = 0x811c9dc5;
    for (let i = 0; i < content.length; i++) {
        hash ^= content.charCodeAt(i);
        hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    return chalk.hex('#' + (hash * 0xfffff * 1000000).toString(16).slice(0, 6))(content);
};
const time = () => chalk.gray(new Date((0, datetime_1.now)()).toISOString());
class Logger {
}
exports.Logger = Logger;
Logger.info = (context, message) => console.info(`${time()} ${colorize(context)}: ${message}`);
Logger.debug = (context, message) => console.debug(`${time()} ${colorize(context)}: ${message}`);
Logger.warn = (context, message) => console.warn(`${time()} ${colorize(context)}: ${message}`);
Logger.error = (context, error) => {
    let message = 'Unknown Error';
    if (error instanceof Error) {
        message = error.message;
    }
    console.error(`${time()} ${colorize(context)}: ${message}`);
};
