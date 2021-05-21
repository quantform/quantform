import { Behaviour, Session } from '@quantform/core';
import { Observable } from 'rxjs';
import { InfluxFeed } from '../influx.feed';
import { tap } from 'rxjs/operators';

export class MeasureBehaviour implements Behaviour {
  constructor(
    private readonly behaviour: Behaviour,
    private readonly storage: InfluxFeed
  ) {}

  describe(session: Session): Observable<any> {
    return this.behaviour
      .describe(session)
      .pipe(tap(it => this.storage.writeMeasurement(it)));
  }
}
