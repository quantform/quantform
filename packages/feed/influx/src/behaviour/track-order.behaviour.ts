import { Behaviour, Session } from '@quantform/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { InfluxFeed } from '../influx.feed';

export class TrackOrderBehaviour implements Behaviour {
  constructor(private readonly storage: InfluxFeed) {}

  describe(session: Session): Observable<any> {
    return session.order().pipe(
      tap(it => {
        const measurement = {
          timestamp: it.timestamp,
          fields: {
            ['side']: it.side,
            ['type']: it.type,
            ['quantity']: it.quantity,
            ['state']: it.state
          },
          tags: {
            ['class']: 'order',
            ['id']: it.id,
            ['instrument']: it.instrument.toString(),
            ['session']: session.id
          }
        };

        if (it.rate) {
          measurement.fields['rate'] = it.rate;
        }

        if (it.stopRate) {
          measurement.fields['stopRate'] = it.stopRate;
        }

        if (it.averageExecutionRate) {
          measurement.fields['averageExecutionRate'] = it.averageExecutionRate;
        }

        if (it.comment) {
          measurement.fields['comment'] = it.comment;
        }

        this.storage.writeMeasurement(measurement);
      })
    );
  }
}
