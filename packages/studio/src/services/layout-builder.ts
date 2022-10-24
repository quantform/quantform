import {
  area,
  bar,
  candlestick,
  histogram,
  LayoutModel,
  LayoutStyle,
  linear,
  MeasurementAreaLayer,
  MeasurementAreaLayerModel,
  MeasurementBarLayer,
  MeasurementBarLayerModel,
  MeasurementCandlestickLayer,
  MeasurementCandlestickLayerModel,
  MeasurementHistogramLayer,
  MeasurementHistogramLayerModel,
  MeasurementLinearLayer,
  MeasurementLinearLayerModel
} from '../models';

export class LayoutBuilder {
  private kindKeyCounter = 0;
  private model: LayoutModel = {
    children: []
  };

  style(style: Partial<LayoutStyle>): LayoutBuilder {
    this.model = { ...this.model, ...style };

    return this;
  }

  linear(
    map: (measure: any) => Omit<MeasurementLinearLayerModel, 'time'>,
    layer: Omit<MeasurementLinearLayer, 'key' | 'type' | 'kind' | 'map'> & {
      pane: number;
      kind?: string;
    }
  ) {
    const measure = linear({
      ...layer,
      kind: layer.kind ?? this.getNextKindKey(),
      map
    });

    this.model.children.push(measure);

    return measure;
  }

  area(
    map: (measure: any) => Omit<MeasurementAreaLayerModel, 'time'>,
    layer: Omit<MeasurementAreaLayer, 'key' | 'type' | 'kind' | 'map'> & {
      pane: number;
      kind?: string;
    }
  ) {
    const measure = area({
      ...layer,
      kind: layer.kind ?? this.getNextKindKey(),
      map
    });

    this.model.children.push(measure);

    return measure;
  }

  bar(
    map: (measure: any) => Omit<MeasurementBarLayerModel, 'time'>,
    layer: Omit<MeasurementBarLayer, 'key' | 'type' | 'kind' | 'map'> & {
      pane: number;
      kind?: string;
    }
  ) {
    const measure = bar({
      ...layer,
      kind: layer.kind ?? this.getNextKindKey(),
      map
    });

    this.model.children.push(measure);

    return measure;
  }

  histogram(
    map: (measure: any) => Omit<MeasurementHistogramLayerModel, 'time'>,
    layer: Omit<MeasurementHistogramLayer, 'key' | 'type' | 'kind' | 'map'> & {
      pane: number;
      kind?: string;
    }
  ) {
    const measure = histogram({
      ...layer,
      kind: layer.kind ?? this.getNextKindKey(),
      map
    });

    this.model.children.push(measure);

    return measure;
  }

  candlestick(
    map: (measure: any) => Omit<MeasurementCandlestickLayerModel, 'time'>,
    layer: Omit<MeasurementCandlestickLayer, 'key' | 'type' | 'kind' | 'map'> & {
      pane: number;
      kind?: string;
    }
  ) {
    const measure = candlestick({
      ...layer,
      kind: layer.kind ?? this.getNextKindKey(),
      map
    });

    this.model.children.push(measure);

    return measure;
  }

  private getNextKindKey() {
    this.kindKeyCounter++;

    return `m-${this.kindKeyCounter}`;
  }

  build(): LayoutModel {
    return this.model;
  }
}
