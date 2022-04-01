import { ISeriesApi } from 'lightweight-charts';
import { aggregateTimestamp, ChartMeasurement } from './tradingview-common';

export interface ChartMarkerTemplate {
  kind: string;
  color: string;
  position: 'aboveBar' | 'belowBar' | 'inBar';
  shape: 'circle' | 'square' | 'arrowUp' | 'arrowDown';
  size?: number;
  text: (value: ChartMeasurement) => string;
}

export function markers(
  style: { markers?: ChartMarkerTemplate[] },
  serie: ISeriesApi<any>,
  measure: ChartMeasurement[]
) {
  if (!style.markers) {
    return;
  }

  let markers: any[] = [];

  for (const marker of style.markers) {
    markers = markers.concat(
      measure
        .filter(it => it.kind == marker.kind)
        .map(it => ({
          time: aggregateTimestamp(it.timestamp),
          color: marker.color,
          position: marker.position,
          shape: marker.shape,
          size: marker.size,
          text: marker.text(it.payload)
        }))
    );
  }

  serie.setMarkers(markers.sort((lhs, rhs) => lhs.time - rhs.time));
}
