import { timestamp } from '../common';
import { Instrument } from '../domain';
import { ExchangeStoreEvent } from '../store/event';
import { Feed } from '.';

export class InMemoryFeed implements Feed {
  private data: Record<string, ExchangeStoreEvent[]> = {};

  async read(
    instrument: Instrument,
    from: timestamp,
    to: timestamp
  ): Promise<ExchangeStoreEvent[]> {
    if (!this.data[instrument.toString()]) {
      return [];
    }

    return this.data[instrument.toString()]
      .filter(it => it.timestamp > from && it.timestamp <= to)
      .sort((lhs, rhs) => lhs.timestamp - rhs.timestamp);
  }

  async write(instrument: Instrument, events: ExchangeStoreEvent[]): Promise<void> {
    if (!this.data[instrument.toString()]) {
      this.data[instrument.toString()] = [];
    }

    const buffer = this.data[instrument.toString()];

    for (const event of events) {
      buffer.push(event);
    }
  }

  clear() {
    this.data = {};
  }
}
