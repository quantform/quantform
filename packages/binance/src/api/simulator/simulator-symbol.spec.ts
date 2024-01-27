import { d, decimal } from '@quantform/core';

import { SimulatorEvent } from './simulator';
import { SimulatorSymbol } from './simulator-symbol';

describe(SimulatorSymbol.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('happy patch', async () => {
    const sut = fixtures.given.simulatorSymbol();

    sut.apply(fixtures.given.event.balanceChanged('base', d(1)));
    sut.apply(fixtures.given.event.balanceChanged('quote', d(1000)));
    sut.apply(fixtures.given.event.orderbookTickerChanged(0, d(9900), d(11000)));

    expect(
      sut.orderNew({
        quantity: '0.001',
        side: 'BUY',
        type: 'MARKET',
        timeInForce: 'GTC',
        symbol: 'BTCUSDT'
      })
    ).toEqual({
      orderId: expect.any(Number),
      status: 'FILLED'
    });

    fixtures.then.event.emitted([
      fixtures.then.event.orderNew({
        orderId: expect.any(Number),
        quantity: '0.001',
        side: 'BUY',
        type: 'MARKET',
        timeInForce: 'GTC',
        symbol: 'BTCUSDT',
        newClientOrderId: undefined,
        price: undefined
      }),
      fixtures.then.event.orderUpdated({
        order: {
          orderId: expect.any(Number),
          origQty: '0.001',
          side: 'BUY',
          type: 'MARKET',
          timeInForce: 'GTC',
          symbol: 'BTCUSDT',
          status: 'FILLED',
          cummulativeQuoteQty: '11',
          executedQty: '0.001',
          clientOrderId: expect.any(String),
          price: undefined,
          time: expect.any(Number)
        }
      })
    ]);

    expect(sut.snapshot()).toEqual(
      expect.objectContaining({
        balance: { base: d(1), quote: d(1000) },
        rate: { bid: d(9900), ask: d(11000) }
      })
    );
  });
});

async function getFixtures() {
  const root = new SimulatorRootFake();
  const baseAsset = 'BTC';
  const quoteAsset = 'USDT';

  return {
    given: {
      simulatorSymbol() {
        const symbol = new SimulatorSymbol(root, {
          symbol: `${baseAsset}${quoteAsset}`,
          baseAsset,
          quoteAsset,
          filters: []
        });

        root.register(symbol);

        return symbol;
      },
      event: {
        balanceChanged(asset: 'base' | 'quote', free: decimal) {
          return {
            type: 'balance-changed' as const,
            what: {
              asset: asset === 'base' ? baseAsset : quoteAsset,
              free,
              locked: d.Zero
            }
          };
        },
        orderbookTickerChanged(timestamp: number, bid: decimal, ask: decimal) {
          return {
            type: 'orderbook-ticker-changed' as const,
            what: {
              symbol: `${baseAsset}${quoteAsset}`,
              timestamp,
              payload: { b: bid.toString(), a: ask.toString(), B: '100', A: '100' }
            }
          };
        }
      }
    },
    then: {
      event: {
        orderNew(
          order: Extract<SimulatorEvent, { type: 'symbol-order-new' }>['what']
        ): Extract<SimulatorEvent, { type: 'symbol-order-new' }> {
          return {
            type: 'symbol-order-new' as const,
            what: order
          };
        },
        orderUpdated(
          order: Extract<SimulatorEvent, { type: 'symbol-order-updated' }>['what']
        ): Extract<SimulatorEvent, { type: 'symbol-order-updated' }> {
          return {
            type: 'symbol-order-updated' as const,
            what: order
          };
        },

        emitted(events: SimulatorEvent[]) {
          expect(root.events).toEqual(events);
        }
      }
    }
  };
}

class SimulatorRootFake {
  readonly events: SimulatorEvent[] = [];
  readonly symbols: SimulatorSymbol[] = [];

  register(symbol: SimulatorSymbol) {
    this.symbols.push(symbol);
  }

  apply(event: SimulatorEvent) {
    this.events.push(event);

    this.symbols.forEach(it => it.apply(event));
  }
}
