import { from, of, tap } from 'rxjs';

import { awake, rule, SessionFeature, strategy } from '@quantform/core';

import { createNextServer, LayoutBuilder, patchSessionContext } from './services';

export * from './components';
export * from './models';
export * from './hooks';

export function study(
  name: string,
  port: number,
  callback: (layout: LayoutBuilder) => Array<SessionFeature>
) {
  strategy(name, () => {
    const layout = new LayoutBuilder();
    const features = callback(layout);

    awake(session =>
      from(createNextServer(port)).pipe(
        tap(() => patchSessionContext({ session, title: name }))
      )
    );

    rule(undefined, () => of(patchSessionContext({ layout: layout.build() })));

    return features;
  });
}
