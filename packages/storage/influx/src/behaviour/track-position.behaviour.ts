import { Behaviour, Session } from '@quantform/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { InfluxFeed } from '../influx.feed';

export class TrackPositionBehaviour implements Behaviour {
  constructor(private readonly storage: InfluxFeed) {}

  describe(session: Session): Observable<any> {
    return session.position().pipe(
      tap(it =>
        this.storage.writeMeasurement({
          timestamp: it.timestamp,
          fields: {
            ['rate']: it.rate,
            ['size']: it.size
          },
          tags: {
            ['class']: 'position',
            ['id']: it.id,
            ['instrument']: it.instrument.toString(),
            ['session']: session.id
          }
        })
      )
    );
  }
}
