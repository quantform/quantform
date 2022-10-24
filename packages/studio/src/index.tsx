import { beforeAll, describe, rule, SessionFeature } from '@quantform/core';
import { from, of, tap } from 'rxjs';

import { createNextServer, LayoutBuilder, patchSessionContext } from './services';

export * from './components';
export * from './models';
export * from './hooks';

export function study(
  name: string,
  port: number,
  callback: (layout: LayoutBuilder) => Array<SessionFeature>
) {
  describe(name, () => {
    const layout = new LayoutBuilder();
    const features = callback(layout);

    beforeAll(session =>
      from(createNextServer(port)).pipe(
        tap(() => patchSessionContext({ session, title: name }))
      )
    );

    rule(undefined, () => of(patchSessionContext({ layout: layout.build() })));

    return features;
  });
}
