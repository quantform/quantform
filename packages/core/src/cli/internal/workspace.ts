import { existsSync, readdirSync } from 'fs';
import { join, parse } from 'path';

import { tryTranspileModule } from './tscompiler';

export function getStrategyModule(name: string, directory: string) {
  const module = readdirSync(directory)
    .map(it => parse(it))
    .find(it => (it.name === name && it.ext == '.ts') || it.ext == '.js');

  return tryTranspileModule(module.base) || join(process.cwd(), directory, module.base);
}

export function getWorkingDirectory(cwd: string): string {
  let dir = join(cwd, 'strategies');

  if (existsSync(dir)) {
    return dir;
  }

  dir = join(cwd, 'src', 'strategies');

  if (existsSync(dir)) {
    return dir;
  }

  throw new Error('Cannot find strategies directory.');
}
