import { Measure } from '@quantform/core';
import { z } from 'zod';

import { LayoutModel } from './LayoutModel';
import { toMeasurementLayerModel } from './MeasurementLayerModel';
import { toMeasurementMarkerModel } from './MeasurementMarkerLayerModel';

export const MeasurementContract = z.object({
  timestamp: z.number(),
  layers: z.record(
    z.object({
      series: z.array(z.any()),
      markers: z.array(z.any())
    })
  )
});

export type MeasurementModel = z.infer<typeof MeasurementContract>;

export function toMeasurementModel(
  measurements: Measure[],
  layout: LayoutModel
): MeasurementModel {
  const layers: Record<
    string,
    {
      series: Array<any>;
      markers: Array<any>;
    }
  > = {};

  layout.children.forEach(pane =>
    pane.children.forEach(layer => {
      measurements.forEach(measure => {
        if (layer.kind == measure.kind) {
          if (!layers[layer.key]) {
            layers[layer.key] = {
              series: [],
              markers: []
            };
          }

          layers[layer.key].series.push(toMeasurementLayerModel(measure, layer));
        }
        if (layer.markers) {
          layer.markers.forEach(marker => {
            if (marker.kind == measure.kind) {
              const markerProps = toMeasurementMarkerModel(measure, marker);
              if (markerProps) {
                if (!layers[layer.key]) {
                  layers[layer.key] = {
                    series: [],
                    markers: []
                  };
                }

                layers[layer.key].markers.push(markerProps);
              }
            }
          });
        }
      });
    })
  );

  return {
    timestamp: 0,
    layers: layers
  };
}
