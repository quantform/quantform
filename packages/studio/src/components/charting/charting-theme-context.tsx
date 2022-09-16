import { createContext, useContext, useReducer, useState } from 'react';

import { Layout, LayoutProps } from './charting-layout';
import { appendLayoutProps } from './charting-layout-transformer';

export type ChartingThemeContextType = {
  theme: Layout;
  setTheme: (theme: Layout) => void;
};

const ChartingThemeContext = createContext<ChartingThemeContextType>({
  theme: { children: [] },
  setTheme: (theme: Layout) => {}
});

export const useChartingThemeContext = () => useContext(ChartingThemeContext);

export const ChartingThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Layout>({
    children: []
  });

  const value = {
    theme,
    setTheme
  };

  return (
    <ChartingThemeContext.Provider value={value}>
      {children}
    </ChartingThemeContext.Provider>
  );
};
