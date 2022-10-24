import { MeasurementLayer } from './MeasurementLayerModel';

export type LayoutStyle = {
  backgroundTopColor?: string;
  backgroundBottomColor?: string;
  borderColor?: string;
  gridColor?: string;
  textColor?: string;
  upColor?: string;
  downColor?: string;
};

export type LayoutModel = {
  children: MeasurementLayer[];
} & LayoutStyle;
