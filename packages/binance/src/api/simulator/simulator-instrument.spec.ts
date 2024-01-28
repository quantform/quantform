import { d, decimal, Instrument } from '@quantform/core';

import { SimulatorEvent } from './simulator';
import { SimulatorInstrument } from './simulator-instrument';

describe(SimulatorInstrument.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  test('happy patch', async () => {
    const sut = fixtures.given.simulatorSymbol();

    sut.apply(fixtures.given.event.orderbookTickerChanged(0, d(9900), d(11000)));

    expect(
      sut.orderNew({
        quantity: '0.001',
        side: 'BUY',
        type: 'MARKET',
        timeInForce: 'GTC',
        symbol: 'BTCUSDT'
      })
    ).toEqual(expect.objectContaining({ id: expect.any(Number), status: 'FILLED' }));

    fixtures.then.events([
      fixtures.then.order.requested({ quantity: d(0.001), price: undefined }),
      fixtures.then.order.settled({ quantity: d(0.001), price: undefined }),
      fixtures.then.order.traded({ quantity: d(0.001), price: d(11000) }),
      fixtures.then.order.filled({ quantity: d(0.001), cumulativeQuoteQuantity: d(11) })
    ]);
  });
});

async function getFixtures() {
  const root = new SimulatorRootFake();
  const baseAsset = 'BTC';
  const quoteAsset = 'USDT';

  return {
    given: {
      simulatorSymbol() {
        const symbol = new SimulatorInstrument(root, {
          symbol: `${baseAsset}${quoteAsset}`,
          baseAsset,
          quoteAsset,
          filters: []
        });

        root.register(symbol);

        return symbol;
      },
      event: {
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
      order: {
        requested(event: {
          quantity: decimal;
          price?: decimal;
        }): Extract<SimulatorEvent, { type: 'simulator-instrument-order-requested' }> {
          return {
            type: 'simulator-instrument-order-requested' as const,
            instrument: expect.any(Instrument),
            id: expect.any(Number),
            clientOrderId: expect.any(String),
            ...event
          };
        },
        settled(event: {
          quantity: decimal;
          price?: decimal;
        }): Extract<SimulatorEvent, { type: 'simulator-instrument-order-settled' }> {
          return {
            type: 'simulator-instrument-order-settled' as const,
            instrument: expect.any(Instrument),
            order: {
              id: expect.any(Number),
              clientOrderId: expect.any(String),
              instrument: expect.any(Instrument),
              cumulativeQuoteQuantity: d.Zero,
              executedQuantity: d.Zero,
              price: event.price,
              quantity: event.quantity,
              status: 'NEW',
              timestamp: expect.any(Number)
            }
          };
        },
        traded(event: {
          quantity: decimal;
          price: decimal;
        }): Extract<SimulatorEvent, { type: 'simulator-instrument-order-trade' }> {
          return {
            type: 'simulator-instrument-order-trade' as const,
            instrument: expect.any(Instrument),
            order: expect.objectContaining({
              //status: 'PARTIALLY_FILLED'
            }),
            trade: {
              quantity: event.quantity,
              price: event.price,
              makerOrderId: expect.any(Number),
              takerOrderId: expect.any(Number)
            }
          };
        },
        filled(event: {
          quantity: decimal;
          cumulativeQuoteQuantity: decimal;
        }): Extract<SimulatorEvent, { type: 'simulator-instrument-order-filled' }> {
          return {
            type: 'simulator-instrument-order-filled' as const,
            instrument: expect.any(Instrument),
            order: {
              id: expect.any(Number),
              clientOrderId: expect.any(String),
              instrument: expect.any(Instrument),
              cumulativeQuoteQuantity: event.cumulativeQuoteQuantity,
              executedQuantity: event.quantity,
              price: undefined,
              quantity: event.quantity,
              status: 'FILLED',
              timestamp: expect.any(Number)
            }
          };
        }
      },
      events(events: SimulatorEvent[]) {
        expect(root.events).toEqual(events);
      }
    }
  };
}

class SimulatorRootFake {
  readonly events: SimulatorEvent[] = [];
  readonly symbols: SimulatorInstrument[] = [];

  register(symbol: SimulatorInstrument) {
    this.symbols.push(symbol);
  }

  apply(event: SimulatorEvent) {
    this.events.push(event);

    this.symbols.forEach(it => it.apply(event));
  }
}
