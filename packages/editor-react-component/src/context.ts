import { interval, Observable, ReplaySubject } from 'rxjs';
import { debounce, map } from 'rxjs/operators';
import { MeasurementApi } from './server-client/apis/MeasurementApi';
import { Configuration } from './server-client';

export interface Measure {
  timestamp: number;
  type: string;
  [key: string]: any;
}

export interface MeasureProvider {
  backward(timestamp: number): Promise<Measure[]>;
  forward(timestamp: number): Promise<Measure[]>;
}

export class ExpressMeasureProvider implements MeasureProvider {
  private readonly api = new MeasurementApi(
    new Configuration({ basePath: this.address })
  );

  constructor(
    private readonly address: string,
    private readonly session: string,
    private readonly descriptor: string
  ) {}

  async backward(timestamp: number): Promise<Measure[]> {
    const response = await this.api.measurementControllerGetRaw({
      name: this.descriptor,
      forward: false,
      timestamp,
      session: this.session
    });

    return await response.raw.json();
  }

  async forward(timestamp: number): Promise<Measure[]> {
    const response = await this.api.measurementControllerGetRaw({
      name: this.descriptor,
      forward: true,
      timestamp,
      session: this.session
    });

    return await response.raw.json();
  }
}

export class MeasureContext {
  private measure: Measure[];
  private readonly serie = new ReplaySubject<Measure[]>(1);
  private readonly range = new ReplaySubject<any>(1);

  get serie$(): Observable<Measure[]> {
    return this.serie.asObservable();
  }

  get viewport$(): Observable<any> {
    return this.range.asObservable();
  }

  setViewport(range: any) {
    this.range.next(range);
  }

  constructor(private readonly provider: MeasureProvider) {
    /* this.viewport$
      .pipe(
        debounce(() => interval(400)),
        map(it => {
          console.log(it);
          const barsInfo = Object.values(this.serie)
            .map(serie => serie.barsInLogicalRange(it))
            .filter(it => it != null);

          if (!barsInfo) {
            return;
          }

          const minBarsBefore = Math.max(...barsInfo.map(it => it.barsBefore));
          const maxBarsBefore = Math.min(...barsInfo.map(it => it.barsAfter));

          if (minBarsBefore !== null && maxBarsBefore !== null) {
            if (minBarsBefore < maxBarsBefore) {
              this.prepend();
            } else {
              this.append();
            }
          }
        })
      )
      .subscribe();*/

    this.prepend();
  }

  merge(measure: Measure[]) {
    if (!measure.length) {
      return;
    }

    if (this.measure) {
      this.measure = this.measure
        .concat(measure)
        .sort((lhs, rhs) => lhs.timestamp - rhs.timestamp);
    } else {
      this.measure = measure;
    }

    this.serie.next(this.measure);
  }

  async prepend() {
    this.merge(
      await this.provider.backward(
        this.measure ? this.measure[0].timestamp : new Date().getTime()
      )
    );
  }

  async append() {
    this.merge(
      await this.provider.forward(
        this.measure ? this.measure[this.measure.length - 1].timestamp : 0
      )
    );
  }
}
