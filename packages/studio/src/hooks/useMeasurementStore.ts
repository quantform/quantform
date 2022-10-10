import create from 'zustand';

import {
  MeasurementLayerModel,
  MeasurementMarkerLayerModel,
  MeasurementModel
} from '../models';

export interface MeasurementState {
  layers: Record<
    string,
    {
      series: MeasurementLayerModel[];
      markers: MeasurementMarkerLayerModel[];
    }
  >;
}

interface MeasurementStateAction {
  upsert(update: MeasurementModel);
}

export const useMeasurementStore = create<MeasurementState & MeasurementStateAction>(
  set => ({
    layers: {},
    upsert: (update: MeasurementModel) =>
      set(state => {
        {
          return update;
        }
      })
  })
);
