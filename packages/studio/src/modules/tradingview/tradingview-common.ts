import { ISeriesApi, Time, UTCTimestamp, WhitespaceData } from 'lightweight-charts';

export interface ChartMeasurement {
  timestamp: number;
  kind: string;
  payload: any;
}

export type ChartSeries = Record<string, ISeriesApi<any>>;

export function aggregateTimestamp(timestamp: number): UTCTimestamp {
  return (timestamp / 1000) as UTCTimestamp;
}

export function createWhitespace(measure: ChartMeasurement): WhitespaceData {
  return {
    time: aggregateTimestamp(measure.timestamp)
  };
}

export function intercept(
  measure: ChartMeasurement[],
  kind: string,
  factory: (it: ChartMeasurement) => { time: Time }
): Array<{ time: Time }> {
  return measure.reduce((aggregate, measurement) => {
    const timestamp = aggregateTimestamp(measurement.timestamp);
    const last = aggregate[aggregate.length - 1];

    if (last && last.time == timestamp) {
      if (measurement.kind == kind) {
        aggregate[aggregate.length - 1] = factory(measurement);
      }
    } else {
      aggregate.push(
        measurement.kind == kind ? factory(measurement) : createWhitespace(measurement)
      );
    }

    return aggregate;
  }, new Array<{ time: Time }>());
}
