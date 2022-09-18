#!/usr/bin/env node
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
const child_process_1 = require("child_process");
const commander_1 = require("commander");
const node_watch_1 = __importDefault(require("node-watch"));
const build_1 = __importDefault(require("./build"));
const dev_1 = __importDefault(require("./dev"));
const pull_1 = __importDefault(require("./pull"));
const run_1 = __importDefault(require("./run"));
const test_1 = __importDefault(require("./test"));
commander_1.program
    .command('build')
    .description('builds a production version of the app')
    .action(() => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, build_1.default)();
}));
commander_1.program
    .command('run')
    .argument('<name>', 'strategy to execute')
    .option('-i, --id <id>', 'session identifier')
    .option('-w', 'watch mode')
    .description('executes strategy in live trading mode')
    .action(run_1.default);
commander_1.program
    .command('dev')
    .argument('<name>', 'strategy to execute')
    .option('-i, --id <id>', 'session identifier')
    .option('-w', 'watch mode')
    .description('executes strategy in paper e.g. simulation mode')
    .action(dev_1.default);
commander_1.program
    .command('test')
    .description('executes strategy in backtesting mode for specified period')
    .argument('<name>', 'strategy to execute')
    .option('-f, --from <from>', 'date from')
    .option('-t, --to <to>', 'date to')
    .option('-w', 'watch mode')
    .action(test_1.default);
commander_1.program
    .command('pull')
    .description('pulls instrument historical data to storage')
    .argument('<name>', 'strategy to execute')
    .argument('<instrument>', 'instrument to import')
    .option('-f, --from <from>', 'date from')
    .option('-t, --to <to>', 'date to')
    .action(pull_1.default);
commander_1.program.name('quantform').description('quantform tools');
if (process.argv.length < 3) {
    commander_1.program.help();
}
else {
    if (process.argv.every(it => it != '-w')) {
        commander_1.program.parse(process.argv);
    }
    else {
        const argv = process.argv.splice(1).filter(it => it != '-w');
        let child;
        const spawnChildProcess = () => {
            console.clear();
            if (child) {
                child.kill();
            }
            child = (0, child_process_1.spawn)('node', argv, {
                stdio: ['inherit', 'inherit', 'inherit', 'ipc']
            });
        };
        spawnChildProcess();
        (0, node_watch_1.default)(process.cwd() + '/src', { recursive: true }, () => spawnChildProcess());
    }
}
