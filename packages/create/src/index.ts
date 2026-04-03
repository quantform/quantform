#!/usr/bin/env node

import { exec } from 'child_process';
import { program } from 'commander';
import editJsonFile from 'edit-json-file';
import { copyFileSync, mkdirSync } from 'fs';
import { basename } from 'path';
import { chdir } from 'process';
import { promisify } from 'util';

const shell = promisify(exec);

program
  .name('quantform')
  .description('Setup the quantform project by running a single command.')
  .argument('<dir>', 'directory to initialize', './')
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

  config.set('main', 'pipeline.js');
  config.set('scripts', {
    live: 'qf live pipeline',
    start: 'qf paper pipeline',
    replay: 'qf replay pipeline',
    pull: 'qf pull pipeline'
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
  config.set('compilerOptions.target', 'es2017');
  config.set('compilerOptions.rootDir', 'src');
  config.set('compilerOptions.outDir', './lib');
  config.set('compilerOptions.baseUrl', './');
  config.set('compilerOptions.incremental', true);
  config.set('include', ['src/**/*']);
  config.set('exclude', ['node_modules', 'test', 'lib', '**/*spec.ts']);

  config.save();
}

async function addDependencies() {
  const devDependencies = ['typescript', '@types/node', 'zod'];

  const dependencies = ['@quantform/core', 'rxjs'];

  for (const dependency of devDependencies) {
    await shell(`npm add -D ${dependency}`);
  }

  for (const dependency of dependencies) {
    await shell(`npm add ${dependency}`);
  }
}

async function copyTemplateFiles() {
  mkdirSync('./src');
  copyFileSync(`${__dirname}/../template/app.ts`, './src/app.ts');
}
