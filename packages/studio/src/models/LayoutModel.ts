import { MeasurementLayer } from './MeasurementLayerModel';

export interface LayoutModel {
  backgroundTopColor?: string;
  backgroundBottomColor?: string;
  borderColor?: string;
  gridColor?: string;
  textColor?: string;
  upColor?: string;
  downColor?: string;
  children: Pane[];
}

export function layout(layout: LayoutModel) {
  return { layout };
}

export interface Pane {
  background?: string;
  children: MeasurementLayer[];
}

export function pane(pane: Pane) {
  return pane;
}
