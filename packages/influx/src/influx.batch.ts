import { Measurement } from './measurement';
import Influx = require('influx');

export class InfluxBatch {
  batch: Influx.IPoint[] = [];

  constructor(private readonly dbName: string, private readonly db: Influx.InfluxDB) {}

  write(measurement: string, data: Measurement) {
    this.batch.push({
      measurement: measurement,
      timestamp: new Date(data.timestamp),
      fields: data.fields,
      tags: data.tags
    });
  }

  async flush(): Promise<void> {
    if (this.batch.length == 0) {
      return;
    }

    const batch = this.batch;
    const batchSize = 10000;

    this.batch = [];

    for (let i = 0; i < Math.max(batch.length, batchSize); i += batchSize) {
      const size = Math.min(batch.length, batchSize);

      await this.db.writePoints(batch.slice(i, i + size), {
        database: this.dbName
      });
    }
  }
}
