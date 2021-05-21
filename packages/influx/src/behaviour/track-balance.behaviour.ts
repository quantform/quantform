import { Behaviour, Session } from '@quantform/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { InfluxFeed } from '../influx.feed';

export class TrackBalanceBehaviour implements Behaviour {
  constructor(private readonly storage: InfluxFeed) {}

  describe(session: Session): Observable<any> {
    return session.balance().pipe(
      tap(it =>
        this.storage.writeMeasurement({
          timestamp: it.timestamp,
          fields: {
            ['free']: it.free,
            ['freezed']: it.freezed,
            ['total']: it.total,
            ['estimatedMargin']: it.getEstimatedMargin(),
            ['estimatedMaintenanceMargin']: it.getEstimatedMaintenanceMargin(),
            ['estimatedUnrealizedPnL']: it.getEstimatedUnrealizedPnL()
          },
          tags: {
            ['class']: 'balance',
            ['asset']: it.asset.toString(),
            ['session']: session.id
          }
        })
      )
    );
  }
}
