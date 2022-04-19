import { existsSync, readdirSync } from 'fs';
import { join, parse } from 'path';
import { Observable } from 'rxjs';
import { Session, SessionDescriptor } from 'src/domain';

export function getStrategyModule(name: string, directory: string) {
  const module = readdirSync(directory)
    .map(it => parse(it))
    .find(it => it.name === name && it.ext == '.js');

  return join(directory, module.base);
}

export function getWorkingDirectory(cwd: string): string {
  let dir = join(cwd, 'dist', 'strategies');

  if (existsSync(dir)) {
    return dir;
  }

  dir = join(cwd, 'dist', 'src', 'strategies');

  if (existsSync(dir)) {
    return dir;
  }

  throw new Error('Cannot find strategies directory.');
}

export type StrategyModule = {
  descriptor: SessionDescriptor;
  default: (session: Session) => Observable<any>;
};

export async function getStrategy(name: string): Promise<StrategyModule> {
  const module = getStrategyModule(name, getWorkingDirectory(process.cwd()));

  if (!existsSync(module)) {
    throw new Error(`Cannot find strategy module "${name}".`);
  }

  return await import(module);
}
