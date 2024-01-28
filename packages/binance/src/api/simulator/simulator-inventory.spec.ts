import { v4 } from 'uuid';

import { Asset, Commission, d, decimal, Instrument } from '@quantform/core';

import { SimulatorEvent } from './simulator';
import { SimulatorInventory } from './simulator-inventory';

describe(SimulatorInventory.name, () => {
  let fixtures: Awaited<ReturnType<typeof getFixtures>>;

  beforeEach(async () => {
    fixtures = await getFixtures();
  });

  describe('limit order', () => {
    test('sell base asset', async () => {
      const { baseAsset } = fixtures.given.assets();
      const sut = fixtures.given.inventory({ asset: baseAsset, free: d(100) });

      const sellLimit = fixtures.given.order({ quantity: d(-10), price: d(200) });

      sut.apply(fixtures.given.event.orderSettled(sellLimit));
      sut.apply(
        fixtures.given.event.orderTraded(sellLimit, { quantity: d(4), price: d(200) })
      );
      sut.apply(
        fixtures.given.event.orderTraded(sellLimit, { quantity: d(6), price: d(200) })
      );
      sut.apply(fixtures.given.event.orderFilled(sellLimit));

      fixtures.then.events([
        fixtures.then.balanceChanged({ asset: baseAsset, free: d(90), locked: d(10) }),
        fixtures.then.balanceChanged({ asset: baseAsset, free: d(90), locked: d(6) }),
        fixtures.then.balanceChanged({ asset: baseAsset, free: d(90), locked: d(0) })
      ]);
    });

    test('sell quote asset', async () => {
      const { quoteAsset } = fixtures.given.assets();
      const sut = fixtures.given.inventory({ asset: quoteAsset, free: d(1000) });

      const sellLimit = fixtures.given.order({ quantity: d(-10), price: d(200) });

      sut.apply(fixtures.given.event.orderSettled(sellLimit));
      sut.apply(
        fixtures.given.event.orderTraded(sellLimit, { quantity: d(4), price: d(200) })
      );
      sut.apply(
        fixtures.given.event.orderTraded(sellLimit, { quantity: d(6), price: d(100) })
      );
      sut.apply(fixtures.given.event.orderFilled(sellLimit));

      fixtures.then.events([
        fixtures.then.balanceChanged({ asset: quoteAsset, free: d(1800), locked: d(0) }),
        fixtures.then.balanceChanged({ asset: quoteAsset, free: d(2400), locked: d(0) })
      ]);
    });

    test('buy base asset', async () => {
      const { baseAsset } = fixtures.given.assets();
      const sut = fixtures.given.inventory({ asset: baseAsset, free: d(10) });

      const buyLimit = fixtures.given.order({ quantity: d(5), price: d(200) });

      sut.apply(fixtures.given.event.orderSettled(buyLimit));
      sut.apply(
        fixtures.given.event.orderTraded(buyLimit, { quantity: d(5), price: d(200) })
      );
      sut.apply(fixtures.given.event.orderFilled(buyLimit));

      sut.apply;

      fixtures.then.events([
        fixtures.then.balanceChanged({ asset: sut.asset, free: d(15), locked: d(0) })
      ]);
    });

    test('buy quote asset', async () => {
      const { quoteAsset } = fixtures.given.assets();
      const sut = fixtures.given.inventory({ asset: quoteAsset, free: d(1000) });

      const buyLimit = fixtures.given.order({ quantity: d(5), price: d(200) });

      sut.apply(fixtures.given.event.orderSettled(buyLimit));
      sut.apply(
        fixtures.given.event.orderTraded(buyLimit, { quantity: d(5), price: d(200) })
      );
      sut.apply(fixtures.given.event.orderFilled(buyLimit));

      sut.apply;

      fixtures.then.events([
        fixtures.then.balanceChanged({ asset: sut.asset, free: d(0), locked: d(1000) }),
        fixtures.then.balanceChanged({ asset: sut.asset, free: d(0), locked: d(0) })
      ]);
    });

    test('cancel base asset', async () => {
      const { baseAsset } = fixtures.given.assets();
      const sut = fixtures.given.inventory({ asset: baseAsset, free: d(100) });

      const sellLimit = fixtures.given.order({ quantity: d(-10), price: d(200) });

      sut.apply(fixtures.given.event.orderSettled(sellLimit));
      sut.apply(
        fixtures.given.event.orderTraded(sellLimit, { quantity: d(4), price: d(200) })
      );
      sut.apply(
        fixtures.given.event.orderCanceled({ ...sellLimit, executedQuantity: d(4) })
      );

      fixtures.then.events([
        fixtures.then.balanceChanged({ asset: baseAsset, free: d(90), locked: d(10) }),
        fixtures.then.balanceChanged({ asset: baseAsset, free: d(90), locked: d(6) }),
        fixtures.then.balanceChanged({ asset: baseAsset, free: d(96), locked: d(0) })
      ]);
    });
  });

  describe('market order', () => {
    test('sell base asset', async () => {
      const { baseAsset } = fixtures.given.assets();
      const sut = fixtures.given.inventory({ asset: baseAsset, free: d(100) });

      const sellLimit = fixtures.given.order({ quantity: d(-10) });

      sut.apply(fixtures.given.event.orderSettled(sellLimit));
      sut.apply(
        fixtures.given.event.orderTraded(sellLimit, { quantity: d(4), price: d(200) })
      );
      sut.apply(
        fixtures.given.event.orderTraded(sellLimit, { quantity: d(6), price: d(100) })
      );
      sut.apply(fixtures.given.event.orderFilled(sellLimit));

      fixtures.then.events([
        fixtures.then.balanceChanged({ asset: baseAsset, free: d(96), locked: d(0) }),
        fixtures.then.balanceChanged({ asset: baseAsset, free: d(90), locked: d(0) })
      ]);
    });

    test('sell quote asset', async () => {
      const { quoteAsset } = fixtures.given.assets();
      const sut = fixtures.given.inventory({ asset: quoteAsset, free: d(1000) });

      const sellLimit = fixtures.given.order({ quantity: d(-10) });

      sut.apply(fixtures.given.event.orderSettled(sellLimit));
      sut.apply(
        fixtures.given.event.orderTraded(sellLimit, { quantity: d(4), price: d(200) })
      );
      sut.apply(
        fixtures.given.event.orderTraded(sellLimit, { quantity: d(6), price: d(100) })
      );
      sut.apply(fixtures.given.event.orderFilled(sellLimit));

      fixtures.then.events([
        fixtures.then.balanceChanged({ asset: quoteAsset, free: d(1800), locked: d(0) }),
        fixtures.then.balanceChanged({ asset: quoteAsset, free: d(2400), locked: d(0) })
      ]);
    });

    test('buy base asset', async () => {
      const { baseAsset } = fixtures.given.assets();
      const sut = fixtures.given.inventory({ asset: baseAsset, free: d(10) });

      const buyLimit = fixtures.given.order({ quantity: d(5) });

      sut.apply(fixtures.given.event.orderSettled(buyLimit));
      sut.apply(
        fixtures.given.event.orderTraded(buyLimit, { quantity: d(5), price: d(200) })
      );
      sut.apply(fixtures.given.event.orderFilled(buyLimit));

      sut.apply;

      fixtures.then.events([
        fixtures.then.balanceChanged({ asset: sut.asset, free: d(15), locked: d(0) })
      ]);
    });

    test('buy quote asset', async () => {
      const { quoteAsset } = fixtures.given.assets();
      const sut = fixtures.given.inventory({ asset: quoteAsset, free: d(1000) });

      const buyLimit = fixtures.given.order({ quantity: d(5) });

      sut.apply(fixtures.given.event.orderSettled(buyLimit));
      sut.apply(
        fixtures.given.event.orderTraded(buyLimit, { quantity: d(5), price: d(200) })
      );
      sut.apply(fixtures.given.event.orderFilled(buyLimit));

      sut.apply;

      fixtures.then.events([
        fixtures.then.balanceChanged({ asset: sut.asset, free: d(2000), locked: d(0) })
      ]);
    });
  });
});

async function getFixtures() {
  const root = new SimulatorRootFake();
  const baseAsset = new Asset('btc', 'binance', 8);
  const quoteAsset = new Asset('usdt', 'binance', 8);
  const instrument = new Instrument(0, baseAsset, quoteAsset, 'BTCUSDT', Commission.Zero);
  const timestamp = 1;

  return {
    given: {
      assets() {
        return { baseAsset, quoteAsset };
      },
      inventory({ asset, free }: { asset: Asset; free: decimal }) {
        const inventory = new SimulatorInventory(root, asset, free);

        root.register(inventory);

        return inventory;
      },
      order({ quantity, price }: { quantity: decimal; price?: decimal }) {
        return {
          quantity,
          price,
          id: 1,
          clientOrderId: v4()
        };
      },
      event: {
        orderRequested(order: {
          id: number;
          clientOrderId: string;
          quantity: decimal;
          price?: decimal;
        }): Extract<SimulatorEvent, { type: 'simulator-instrument-order-requested' }> {
          return {
            type: 'simulator-instrument-order-requested' as const,
            instrument,
            ...order
          };
        },
        orderSettled(order: {
          id: number;
          clientOrderId: string;
          quantity: decimal;
          price?: decimal;
        }): Extract<SimulatorEvent, { type: 'simulator-instrument-order-settled' }> {
          return {
            type: 'simulator-instrument-order-settled' as const,
            timestamp,
            instrument,
            order: {
              instrument,
              cumulativeQuoteQuantity: d.Zero,
              executedQuantity: d.Zero,
              status: 'NEW',
              timestamp: 1,
              ...order
            }
          };
        },
        orderTraded(
          order: {
            id: number;
            clientOrderId: string;
            quantity: decimal;
            price?: decimal;
          },
          trade: { quantity: decimal; price: decimal }
        ): Extract<SimulatorEvent, { type: 'simulator-instrument-order-trade' }> {
          return {
            type: 'simulator-instrument-order-trade' as const,
            timestamp,
            instrument,
            order: {
              instrument,
              cumulativeQuoteQuantity: d.Zero,
              executedQuantity: d.Zero,
              status: 'PARTIALLY_FILLED',
              timestamp: 1,
              ...order
            },
            trade: {
              makerOrderId: 1,
              takerOrderId: 2,
              ...trade
            }
          };
        },
        orderFilled(order: {
          id: number;
          clientOrderId: string;
          quantity: decimal;
          price?: decimal;
        }): Extract<SimulatorEvent, { type: 'simulator-instrument-order-filled' }> {
          return {
            type: 'simulator-instrument-order-filled' as const,
            timestamp,
            instrument,
            order: {
              instrument,
              cumulativeQuoteQuantity: d.Zero,
              executedQuantity: order.quantity,
              price: order.price,
              status: 'FILLED',
              timestamp: 1,
              ...order
            }
          };
        },
        orderCanceled(order: {
          id: number;
          clientOrderId: string;
          quantity: decimal;
          price?: decimal;
          executedQuantity: decimal;
        }): Extract<SimulatorEvent, { type: 'simulator-instrument-order-canceled' }> {
          return {
            type: 'simulator-instrument-order-canceled' as const,
            timestamp,
            instrument,
            order: {
              instrument,
              cumulativeQuoteQuantity: d.Zero,
              status: 'CANCELED',
              timestamp: 1,
              ...order
            }
          };
        }
      }
    },
    then: {
      balanceChanged(event: {
        asset: Asset;
        free: decimal;
        locked: decimal;
      }): Extract<SimulatorEvent, { type: 'simulator-inventory-balance-changed' }> {
        return {
          type: 'simulator-inventory-balance-changed' as const,
          timestamp: expect.any(Number),
          ...event
        };
      },
      events(events: SimulatorEvent[]) {
        expect(root.events).toEqual(events);
      }
    }
  };
}

class SimulatorRootFake {
  readonly events: SimulatorEvent[] = [];
  readonly inventory: SimulatorInventory[] = [];

  register(inventory: SimulatorInventory) {
    this.inventory.push(inventory);
  }

  apply(event: SimulatorEvent) {
    this.events.push(event);

    this.inventory.forEach(it => it.apply(event));
  }
}
