import create from 'zustand';

export const useAppStore = create<{ title: string; setTitle: (title: string) => void }>(
  set => ({
    title: '',
    setTitle: (title: string) => set({ title })
  })
);
