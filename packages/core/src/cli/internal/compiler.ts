import { Observable } from 'rxjs';

import { Session, SessionDescriptor } from '../../domain';

type SessionModule = {
  descriptor: SessionDescriptor;
  default: (session: Session) => Observable<any>;
};

export async function compile(path: string): Promise<SessionModule> {
  const module = await import(path);

  /* Ass ts-node support here
  const node = await import('ts-node');

  const service = node.register({
    files: true
  });
*/

  return module;
}
