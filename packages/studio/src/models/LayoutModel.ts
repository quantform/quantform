import { MeasurementLayer } from './MeasurementLayerModel';

export interface LayoutModel {
  backgroundTopColor?: string;
  backgroundBottomColor?: string;
  borderColor?: string;
  gridColor?: string;
  textColor?: string;
  upColor?: string;
  downColor?: string;
  children: MeasurementLayer[];
}
