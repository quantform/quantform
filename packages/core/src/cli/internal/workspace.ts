import { join } from 'path';
import { Observable } from 'rxjs';

import { Session, SessionDescriptor } from './../../domain';
import { workingDirectory } from './../../shared';

export type StrategyModule = {
  descriptor: SessionDescriptor;
  default: (session: Session) => Observable<any>;
};

export function buildDirectory() {
  return join(process.cwd(), workingDirectory(), 'build');
}

export async function getModule(name: string): Promise<StrategyModule> {
  return await import(join(buildDirectory(), name));
}
