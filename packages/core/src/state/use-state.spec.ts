import { event } from './event';
import { useStateRouter } from './use-state-router';
import { useState } from './use-state';

describe(useState.name, () => {
  let fixtures: ReturnType<typeof getFixtures>;

  beforeEach(() => {
    fixtures = getFixtures();
  });
});

function getFixtures() {
  const add = event('math://add')<{ value: number }>();

  const state = useState<ReturnType<typeof add>>(({ on }) => {
    const state = { value: 0 };

    return [
      on('math://add', ({ value }) => {
        state.value += value;
      })
    ];
  });

  const router = useStateRouter(state);

  router.watch('math://add').subscribe(console.log);
  router.apply(add({ value: 1 }));

  return {};
}
