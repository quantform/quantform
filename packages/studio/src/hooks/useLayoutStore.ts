import create from 'zustand';

import { LayoutModel } from '../models';

export const useLayoutStore = create<
  LayoutModel & { setLayout: (layout: LayoutModel) => void }
>(set => ({
  children: [],
  backgroundTopColor: '#222',
  backgroundBottomColor: '#111',
  gridColor: '#333333',
  borderColor: '#fff',
  upColor: '#0f0',
  downColor: '#f00',
  setLayout: (layout: LayoutModel) => set({ ...layout })
}));
