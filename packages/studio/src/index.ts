import { beforeAll, describe, Plugin, rule, Session } from '@quantform/core';
import { from, of, tap } from 'rxjs';

import { LayoutModel } from './models';
import { createNextServer, LayoutBuilder } from './services';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalAny = global as any;

export function getStudySession(): Session {
  if (!globalAny.session) {
    throw new Error('Session is not set!');
  }

  return globalAny.session;
}

export function getStudyLayout(): LayoutModel {
  if (!globalAny.layout) {
    throw new Error('Session layout not set!');
  }

  return globalAny.layout;
}

export function study(
  name: string,
  port: number,
  callback: (layout: LayoutBuilder) => Array<Plugin>
) {
  describe(name, () => {
    const layout = new LayoutBuilder();

    const wrapped = callback(layout);

    beforeAll(session =>
      from(createNextServer(port)).pipe(
        tap(() => {
          globalAny.session = session;
        })
      )
    );

    rule(undefined, () => {
      globalAny.layout = layout.build();

      return of(0);
    });

    return wrapped;
  });
}
