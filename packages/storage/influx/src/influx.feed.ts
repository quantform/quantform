import Influx = require('influx');
import {
  Behaviour,
  ExchangeStoreEvent,
  Instrument,
  InstrumentSelector,
  OrderbookPatchEvent,
  Feed,
  TradePatchEvent,
  timestamp
} from '@quantform/core';
import { InfluxBatch } from './influx.batch';
import { Measurement } from './measurement';
import { TrackBalanceBehaviour } from './behaviour/track-balance.behaviour';
import { TrackOrderBehaviour } from './behaviour/track-order.behaviour';
import { TrackPositionBehaviour } from './behaviour/track-position.behaviour';
import { MeasureBehaviour } from './behaviour/measure.behaviour';

export class InfluxFeed implements Feed {
  readonly measurementDatabaseName = 'session';
  readonly orderbookDatabaseName = 'orderbook';

  private readonly db: Influx.InfluxDB;
  private readonly measurement: InfluxBatch;
  private readonly orderbook: InfluxBatch;

  constructor() {
    if (!process.env.INFLUXDB) {
      throw new Error('missing env');
    }

    this.db = new Influx.InfluxDB(process.env.INFLUXDB);

    this.measurement = new InfluxBatch(this.measurementDatabaseName, this.db);
    this.orderbook = new InfluxBatch(this.orderbookDatabaseName, this.db);
  }

  async initialize(): Promise<void> {
    const names = await this.db.getDatabaseNames();

    if (!names.includes(this.measurementDatabaseName)) {
      await this.db.createDatabase(this.measurementDatabaseName);
    }

    if (!names.includes(this.orderbookDatabaseName)) {
      await this.db.createDatabase(this.orderbookDatabaseName);
    }
  }

  async read(
    instrument: InstrumentSelector,
    from: timestamp,
    to: timestamp
  ): Promise<ExchangeStoreEvent[]> {
    const size = 10000;

    const response = await this.db.query(
      `select * from "${instrument.toString()}"
        where time > '${new Date(from).toISOString()}'
          and time <= '${new Date(to).toISOString()}'
        order by time
        limit ${size}`,
      {
        precision: 'ms',
        database: this.orderbookDatabaseName
      }
    );

    return response
      .map(it => {
        if (it['type'] == 'orderbook-patch') {
          return new OrderbookPatchEvent(
            instrument,
            it['bestAskRate'],
            it['bestAskQuantity'],
            it['bestBidRate'],
            it['bestBidQuantity'],
            it['time'].getTime()
          );
        } else if (it['type'] == 'ticker-patch') {
          return new TradePatchEvent(
            instrument,
            it['rate'],
            it['quantity'],
            it['time'].getTime()
          );
        }
      })
      .filter(it => it != null);
  }

  writeMeasurement(measurement: Measurement): void {
    this.measurement.write('session', measurement);
  }

  async write(instrument: Instrument, events: ExchangeStoreEvent[]): Promise<void> {
    for (const event of events) {
      if (event instanceof OrderbookPatchEvent) {
        this.orderbook.write(instrument.toString(), {
          timestamp: event.timestamp,
          fields: {
            ['bestAskRate']: event.bestAskRate,
            ['bestAskQuantity']: event.bestAskQuantity,
            ['bestBidRate']: event.bestBidRate,
            ['bestBidQuantity']: event.bestBidQuantity
          },
          tags: {
            ['type']: event.type
          }
        });
      } else if (event instanceof TradePatchEvent) {
        this.orderbook.write(instrument.toString(), {
          timestamp: event.timestamp,
          fields: {
            ['rate']: event.rate,
            ['quantity']: event.quantity
          },
          tags: {
            ['type']: event.type
          }
        });
      }
    }

    if (this.orderbook.batch.length > 1000) {
      await this.orderbook.flush();
    }
  }

  flushMeasurement(): Promise<void> {
    return this.measurement.flush();
  }

  trackBalance(): Behaviour {
    return new TrackBalanceBehaviour(this);
  }

  trackOrder(): Behaviour {
    return new TrackOrderBehaviour(this);
  }

  trackPosition(): Behaviour {
    return new TrackPositionBehaviour(this);
  }

  measure(behaviour: Behaviour): Behaviour {
    return new MeasureBehaviour(behaviour, this);
  }
}
