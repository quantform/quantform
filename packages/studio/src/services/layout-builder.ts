import { candlestick, LayoutModel, MeasurementCandlestickLayer, pane } from '../models';

export class LayoutBuilder {
  private readonly c = new Array<any>();

  candlestick(
    layer: Omit<MeasurementCandlestickLayer, 'key' | 'type'> & { key?: string }
  ) {
    const p = candlestick(layer);

    this.c.push(p);

    return p;
  }

  build(): LayoutModel {
    return {
      children: [
        pane({
          children: this.c
        })
      ]
    };
  }
}
