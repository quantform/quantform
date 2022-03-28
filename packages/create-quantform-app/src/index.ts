#!/usr/bin/env node

import { exec } from 'child_process';
import { program } from 'commander';
import * as editJsonFile from 'edit-json-file';
import { copyFileSync, mkdirSync } from 'fs';
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
    await addTypescript();
    await copyTemplateFiles();
    await addDependencies();
  })
  .parse(process.argv);

async function createDirectory(dir: string) {
  mkdirSync(dir);
  chdir(dir);
}

async function addPackageJson() {
  await shell(`npx yarn init --yes`);

  const config = editJsonFile(`./package.json`);

  config.set('scripts', {
    build: 'tsc',
    'start:dev': 'yarn qf dev ./strategy.js'
  });

  config.save();
}

async function addTypescript() {
  await shell(`tsc --init`);

  const config = editJsonFile(`./tsconfig.json`);

  config.set('compilerOptions.module', 'commonjs');
  config.set('compilerOptions.declaration', true);
  config.set('compilerOptions.removeComments', true);
  config.set('compilerOptions.emitDecoratorMetadata', true);
  config.set('compilerOptions.experimentalDecorators', true);
  config.set('compilerOptions.allowSyntheticDefaultImports', true);
  config.set('compilerOptions.target', 'es2017');
  config.set('compilerOptions.outDir', './dist');
  config.set('compilerOptions.baseUrl', './');
  config.set('compilerOptions.incremental', true);
  config.set('include', ['*.ts', 'src/*']);
  config.set('exclude', ['node_modules', 'test', 'dist', '**/*spec.ts']);

  config.save();
}

async function addDependencies() {
  const devDependencies = ['typescript', '@types/node', 'ts-node'];
  const dependencies = ['@quantform/core', '@quantform/binance', 'rxjs'];

  for (const dependency of devDependencies) {
    await shell(`npx yarn add -D ${dependency}`);
  }

  for (const dependency of dependencies) {
    await shell(`npx yarn add ${dependency}`);
  }
}

async function copyTemplateFiles() {
  mkdirSync('./src');
  copyFileSync(`${__dirname}/../template/strategy.template`, './src/strategy.ts');
}
