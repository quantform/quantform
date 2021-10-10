import {
  InMemoryFeed,
  instrumentOf,
  Session,
  SessionDescriptor,
  SessionFactory
} from '@quantform/core';
import { BinanceAdapter } from '../binance.adapter';

const feed = new InMemoryFeed();

const descriptor: SessionDescriptor = {
  adapter: () => [new BinanceAdapter()],
  feed: () => feed
};

let session: Session;

describe('binance integration tests', () => {
  beforeEach(async () => {
    session = SessionFactory.paper(descriptor, {
      balance: {}
    });

    await session.initialize();
  });

  test('has instruments collection', () => {
    expect(
      Object.keys(session.store.snapshot.universe.instrument).length
    ).toBeGreaterThan(0);
  });

  test('subscribes to orderbook of specific instrument', done => {
    session.orderbook(instrumentOf('binance:btc-usdt')).subscribe(it => {
      expect(it.bestAskRate).toBeGreaterThan(0);
      expect(it.bestAskQuantity).toBeGreaterThan(0);
      expect(it.bestBidRate).toBeGreaterThan(0);
      expect(it.bestBidQuantity).toBeGreaterThan(0);

      done();
    });
  });
});
