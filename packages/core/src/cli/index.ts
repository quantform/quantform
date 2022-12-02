#!/usr/bin/env node

import { ChildProcess, spawn } from 'child_process';
import { program } from 'commander';
import watch from 'node-watch';

import build from '@lib/cli/build';
import dev from '@lib/cli/dev';
import pull from '@lib/cli/pull';
import run from '@lib/cli/run';
import test from '@lib/cli/test';

program
  .command('build')
  .description('builds a production version of the app')
  .action(async () => {
    await build();
  });

program
  .command('run')
  .argument('<name>', 'strategy to execute')
  .option('-i, --id <id>', 'session identifier')
  .option('-w', 'watch mode')
  .description('executes strategy in live trading mode')
  .action(run);

program
  .command('dev')
  .argument('<name>', 'strategy to execute')
  .option('-i, --id <id>', 'session identifier')
  .option('-w', 'watch mode')
  .description('executes strategy in paper e.g. simulation mode')
  .action(dev);

program
  .command('test')
  .description('executes strategy in backtesting mode for specified period')
  .argument('<name>', 'strategy to execute')
  .option('-f, --from <from>', 'date from')
  .option('-t, --to <to>', 'date to')
  .option('-w', 'watch mode')
  .action(test);

program
  .command('pull')
  .description('pulls instrument historical data to storage')
  .argument('<name>', 'strategy to execute')
  .argument('<instrument>', 'instrument to import')
  .option('-f, --from <from>', 'date from')
  .option('-t, --to <to>', 'date to')
  .action(pull);

program.name('quantform').description('quantform tools');

if (process.argv.length < 3) {
  program.help();
} else {
  if (process.argv.every(it => it != '-w')) {
    program.parse(process.argv);
  } else {
    const argv = process.argv.splice(1).filter(it => it != '-w');
    let child: ChildProcess;

    const spawnChildProcess = () => {
      console.clear();

      if (child) {
        child.kill();
      }

      child = spawn('node', argv, {
        stdio: ['inherit', 'inherit', 'inherit', 'ipc']
      });
    };

    spawnChildProcess();

    watch(process.cwd() + '/src', { recursive: true }, () => spawnChildProcess());
  }
}
