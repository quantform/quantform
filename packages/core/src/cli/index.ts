#!/usr/bin/env node

import { ChildProcess, spawn } from 'child_process';
import { program } from 'commander';
import watch from 'node-watch';

import build from '@lib/cli/build';
import live from '@lib/cli/live';
import paper from '@lib/cli/paper';
import pull from '@lib/cli/pull';
import replay from '@lib/cli/replay';

program
  .command('build')
  .description('builds a production version of the app')
  .action(async () => {
    await build();
  });

program
  .command('live')
  .argument('<name>', 'strategy to execute')
  .option('-i, --id <id>', 'session identifier')
  .option('-r, --recording', 'recording mode for replay purposes')
  .option('-w', 'watch mode')
  .description('executes strategy in live trading mode')
  .action(live);

program
  .command('paper')
  .argument('<name>', 'strategy to execute')
  .option('-i, --id <id>', 'session identifier')
  .option('-r, --recording', 'recording mode for replay purposes')
  .option('-w', 'watch mode')
  .description('executes strategy in paper e.g. simulation mode')
  .action(paper);

program
  .command('replay')
  .description('executes strategy in backtesting mode for specified period')
  .argument('<name>', 'strategy to execute')
  .option('-f, --from <from>', 'date from')
  .option('-t, --to <to>', 'date to')
  .option('-w', 'watch mode')
  .action(replay);

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
        stdio: 'pipe'
      });
    };

    spawnChildProcess();

    watch(process.cwd() + '/src', { recursive: true }, () => spawnChildProcess());
  }
}
