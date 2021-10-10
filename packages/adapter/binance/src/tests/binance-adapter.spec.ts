import { InMemoryFeed, SessionDescriptor, SessionFactory, Store } from '@quantform/core';
import { BinanceAdapter } from '../binance.adapter';

const feed = new InMemoryFeed();

const descriptor: SessionDescriptor = {
  adapter: () => [new BinanceAdapter()],
  feed: () => feed
};

describe('binance integration tests', () => {
  test('has instruments collection', async () => {
    const session = SessionFactory.paper(descriptor, {
      balance: {}
    });

    await session.initialize();

    expect(
      Object.keys(session.store.snapshot.universe.instrument).length
    ).toBeGreaterThan(0);
  });
});
