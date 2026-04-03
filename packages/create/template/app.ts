import { of } from 'rxjs';

import { app } from '@quantform/core';

export default app()
  .use(sqlite())
  .use(replayOptions({ from: 0, to: 100, storage: 'test' }))
  .start(strategy);

function strategy() {
  return of(1);
}
