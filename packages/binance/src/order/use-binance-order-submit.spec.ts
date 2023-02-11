import { Observable, of } from 'rxjs';
import waitForExpect from 'wait-for-expect';

import { instrumentFixtures } from '@lib/instrument/instrument.fixtures';
import {
  d,
  decimal,
  Instrument,
  makeTestModule,
  mockedFunc,
  useTimestamp
} from '@quantform/core';

import { useBinanceOrderSubmit } from './use-binance-order-submit';
import { useBinanceOrderSubmitCommand } from './use-binance-order-submit-command';

jest.mock('./use-binance-order-submit-command', () => ({
  ...jest.requireActual('./use-binance-order-submit-command'),
  useBinanceOrderSubmitCommand: jest.fn()
}));

jest.mock('@quantform/core', () => ({
  ...jest.requireActual('@quantform/core'),
  useTimestamp: jest.fn()
}));

describe(useBinanceOrderSubmit.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  describe('submit', () => {
    test('market order submitted, sequence of changes emitted', async () => {
      const { act, instruments } = fixtures;

      await act(async () => {
        const submit = fixtures.whenOrderSubmitted(instruments.btc_usdt, d(1));

        await fixtures.thenSequenceEmitted(submit, [
          { quantity: d(1), rate: undefined, cancelable: false },
          { cancelable: false }
        ]);
      });
    });

    test('limit order submitted, sequence of changes emitted', async () => {
      const { act, instruments } = fixtures;

      await act(async () => {
        const submit = fixtures.whenOrderSubmitted(instruments.btc_usdt, d(1), d(10000));

        await fixtures.thenSequenceEmitted(submit, [
          { quantity: d(1), rate: d(10000), cancelable: false },
          { cancelable: true }
        ]);
      });
    });
  });

  test('order submitted then canceled, sequence of changes emitted', async () => {
    const { act, instruments } = fixtures;

    await act(async () => {
      const submit = fixtures.whenOrderSubmitted(instruments.btc_usdt, d(1), d(10000));

      await fixtures.thenSequenceEmitted(submit, [
        { quantity: d(1), rate: d(10000), cancelable: false },
        { cancelable: true, binanceId: 123 }
      ]);

      const cancel = fixtures.whenOrderCanceled(instruments.btc_usdt);

      await fixtures.thenSequenceEmitted(cancel, [{ cancelable: false }]);
    });
  });
});

async function getFixtures() {
  const { act } = await makeTestModule([]);

  let timestamp = 1;
  mockedFunc(useTimestamp).mockImplementation(() => timestamp++);
  mockedFunc(useBinanceOrderSubmitCommand).mockReturnValue(of({ orderId: 123 }));

  return {
    act,
    instruments: instrumentFixtures,
    givenOrderOpened: () => {},
    whenOrderSubmitted: (instrument: Instrument, quantity: decimal, rate?: decimal) => {
      const { submit } = useBinanceOrderSubmit(instrument);

      return submit({ quantity, rate });
    },
    whenOrderCanceled: (instrument: Instrument) => {
      const { cancel } = useBinanceOrderSubmit(instrument);

      return cancel({ id: 'order-1' });
    },
    thenSequenceEmitted: async <T>(input: Observable<T>, events: Partial<T>[]) => {
      const changes = Array.of<T>();
      const subscription = input.subscribe(it => changes.push({ ...it }));

      await waitForExpect(() =>
        expect(changes).toEqual(events.map(it => expect.objectContaining({ ...it })))
      );

      subscription.unsubscribe();
    }
  };
}
