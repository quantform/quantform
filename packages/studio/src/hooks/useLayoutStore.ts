import create from 'zustand';

import { LayoutModel } from '../models';

export const useLayoutStore = create<
  LayoutModel & { setLayout: (layout: LayoutModel) => void }
>(set => ({
  children: [],
  backgroundBottomColor: '#111',
  backgroundTopColor: '#1a1a1a',
  gridColor: '#222222',
  borderColor: '#fff',
  upColor: '#0f0',
  downColor: '#f00',
  setLayout: (layout: LayoutModel) => set({ ...layout })
}));
