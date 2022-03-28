#!/usr/bin/env node

import { program } from 'commander';

import { backtest } from './backtest';
import { dev } from './dev';
import { pull } from './pull';
import { run } from './run';

program
  .command('run')
  .argument('<name>', 'strategy to execute')
  .option('-i, --id <id>', 'session identifier')
  .description('executes strategy in live trading mode')
  .action(run);

program
  .command('dev')
  .argument('<name>', 'strategy to execute')
  .option('-i, --id <id>', 'session identifier')
  .description('executes strategy in paper e.g. simulation mode')
  .action(dev);

program
  .command('backtest')
  .description('executes strategy in backtesting mode for specified period')
  .argument('<name>', 'strategy to execute')
  .option('-f, --from <from>', 'date from')
  .option('-t, --to <to>', 'date to')
  .action(backtest);

program
  .command('pull')
  .description('pulls instrument historical data to storage')
  .argument('<name>', 'strategy to execute')
  .argument('<instrument>', 'instrument to import')
  .option('-f, --from <from>', 'date from')
  .option('-t, --to <to>', 'date to')
  .action(pull);

program.name('quantform').description('quantform tools').parse(process.argv);
