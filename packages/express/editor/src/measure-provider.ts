import { Measure } from '@quantform/editor-react-component';
import { Configuration, MeasurementApi } from './api';

export class MeasureProvider implements MeasureProvider {
  private readonly api = new MeasurementApi(
    new Configuration({ basePath: this.address })
  );

  constructor(
    private readonly address: string,
    private readonly session: number,
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
