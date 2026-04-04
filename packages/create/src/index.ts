#!/usr/bin/env node

import { exec } from 'child_process';
import { program } from 'commander';
import editJsonFile from 'edit-json-file';
import { mkdirSync } from 'fs';
import { cp } from 'fs/promises';
import { basename } from 'path';
import { chdir } from 'process';
import { promisify } from 'util';

const shell = promisify(exec);

program
  .name('quantform')
  .description('Setup the quantform project by running a single command.')
  .argument('<dir>', 'directory to initialize')
  .action(async dir => {
    await createDirectory(dir);
    await addPackageJson();
    await addDependencies();
    await addTypescript();
    await copyTemplateFiles();
  })
  .parse(process.argv);

async function createDirectory(dir: string) {
  if (basename(dir) != '' && basename(dir) != '.') {
    mkdirSync(dir);
    chdir(dir);
  }
}

async function addPackageJson() {
  await shell(`npm init --yes`);

  const config = editJsonFile(`./package.json`);

  config.set('scripts', {
    live: 'qf live app',
    start: 'qf paper app',
    replay: 'qf replay app',
    pull: 'qf pull app'
  });

  config.save();
}

async function addTypescript() {
  const config = editJsonFile(`./tsconfig.json`);

  config.set('compilerOptions.module', 'commonjs');
  config.set('compilerOptions.declaration', true);
  config.set('compilerOptions.removeComments', true);
  config.set('compilerOptions.emitDecoratorMetadata', true);
  config.set('compilerOptions.experimentalDecorators', true);
  config.set('compilerOptions.allowSyntheticDefaultImports', true);
  config.set('compilerOptions.target', 'es2022');
  config.set('compilerOptions.rootDir', 'src');
  config.set('compilerOptions.outDir', './lib');
  config.set('compilerOptions.incremental', true);
  config.set('include', ['src/**/*']);
  config.set('exclude', ['node_modules', 'test', 'lib', '**/*spec.ts']);

  config.save();
}

async function addDependencies() {
  for (const dependency of [
    'typescript',
    '@types/node',
    '@types/unzipper',
    'jest',
    '@types/jest'
  ]) {
    await shell(`npm add -D ${dependency}`);
  }

  for (const dependency of [
    '@quantform/core',
    '@quantform/sqlite',
    'rxjs',
    'zod',
    'csv-parser',
    'unzipper'
  ]) {
    await shell(`npm add ${dependency}`);
  }
}

async function copyTemplateFiles() {
  mkdirSync('./src');

  await cp(`${__dirname}/../template`, './src', { recursive: true });
}
