import { existsSync } from 'fs';
import { Observable } from 'rxjs';

import { Session, SessionDescriptor } from '../../domain';
import { getStrategyModule, getWorkingDirectory } from './workspace';

type StrategyModule = {
  descriptor: SessionDescriptor;
  default: (session: Session) => Observable<any>;
};

export async function loadStrategy(name: string): Promise<StrategyModule> {
  const module = getStrategyModule(name, getWorkingDirectory(process.cwd()));

  if (!existsSync(module)) {
    throw new Error(`Cannot find strategy module "${name}".`);
  }

  return await import(module);
}
