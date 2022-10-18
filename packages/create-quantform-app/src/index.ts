#!/usr/bin/env node

import { exec } from 'child_process';
import { program } from 'commander';
import editJsonFile from 'edit-json-file';
import { copyFileSync, mkdirSync, writeFileSync } from 'fs';
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
    await addSWCConfig();
    await copyTemplateFiles();
    await addDependencies();
  })
  .parse(process.argv);

async function createDirectory(dir: string) {
  mkdirSync(dir);
  chdir(dir);
}

async function addPackageJson() {
  await shell(`npm init --yes`);

  const config = editJsonFile(`./package.json`);

  config.set('main', 'index.js');
  config.set('scripts', {
    build: 'tsc',
    start: 'qf dev golden-cross'
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

async function addSWCConfig() {
  writeFileSync('./.swcrc', '{}');

  const config = editJsonFile(`./.swcrc`);

  config.set('$schema', 'http://json.schemastore.org/swcrc');
  config.set('jsc.parser.syntax', 'typescript');
  config.set('jsc.parser.tsx', false);
  config.set('module.type', 'commonjs');
  config.set('module.strict', false);
  config.set('module.strictMode', true);
  config.set('module.lazy', false);
  config.set('module.noInterop', false);

  config.save();
}

async function addDependencies() {
  const devDependencies = [
    'typescript',
    '@types/node',
    'ts-node',
    '@swc/cli',
    '@swc/core'
  ];

  const dependencies = [
    '@quantform/core',
    '@quantform/binance',
    '@quantform/sqlite',
    '@quantform/stl',
    'rxjs'
  ];

  for (const dependency of devDependencies) {
    await shell(`npm add -D ${dependency}`);
  }

  for (const dependency of dependencies) {
    await shell(`npm add ${dependency}`);
  }
}

async function copyTemplateFiles() {
  mkdirSync('./src');
  copyFileSync(`${__dirname}/../template/index.template`, './src/index.ts');
}
