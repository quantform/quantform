import {
  InMemoryStorage,
  Feed,
  instrumentOf,
  Session,
  SessionDescriptor,
  paper,
  now
} from '@quantform/core';
import { BinanceAdapter } from '../binance.adapter';

const feed = new Feed(new InMemoryStorage());

const descriptor: SessionDescriptor = {
  id: now(),
  adapter: [new BinanceAdapter()],
  feed,
  options: {
    paper: {
      balance: {}
    }
  }
};

let session: Session;

describe('binance integration tests', () => {
  beforeEach(async () => {
    session = paper(descriptor);

    await session.awake(undefined);
  });

  afterEach(async () => {
    await session.dispose();
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

  test('subscribes to trade of specific instrument', done => {
    session.trade(instrumentOf('binance:btc-usdt')).subscribe(it => {
      expect(it.rate).toBeGreaterThan(0);
      expect(it.quantity).toBeGreaterThan(0);

      done();
    });
  });
});
