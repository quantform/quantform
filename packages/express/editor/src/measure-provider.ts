import {
  SessionMeasure,
  DataProvider,
  EditorTemplate,
  parseTemplate
} from '@quantform/editor-react-component';
import { Configuration, DescriptorApi, MeasurementApi } from './api';

export class ExpressMeasureProvider implements DataProvider {
  private readonly measurementApi = new MeasurementApi(
    new Configuration({ basePath: this.address })
  );

  private readonly descriptorApi = new DescriptorApi(
    new Configuration({ basePath: this.address })
  );

  constructor(
    private readonly address: string,
    private readonly session: number,
    private readonly descriptor: string
  ) {}

  async backward(timestamp: number): Promise<SessionMeasure[]> {
    const response = await this.measurementApi.measurementControllerGetRaw({
      name: this.descriptor,
      forward: false,
      timestamp,
      session: this.session
    });

    return await response.raw.json();
  }

  async forward(timestamp: number): Promise<SessionMeasure[]> {
    const response = await this.measurementApi.measurementControllerGetRaw({
      name: this.descriptor,
      forward: true,
      timestamp,
      session: this.session
    });

    return await response.raw.json();
  }

  async template(): Promise<EditorTemplate> {
    const response = await this.descriptorApi.descriptorControllerTemplate({
      name: this.descriptor
    });

    return parseTemplate(response.content);
  }

  subscribe(handler: (message: any) => void): { close: () => void } {
    const stream = new EventSource(`${this.address}/event?context=${this.session}`);

    stream.onmessage = handler;

    return stream;
  }
}
