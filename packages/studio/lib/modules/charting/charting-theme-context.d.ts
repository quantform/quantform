/// <reference types="react" />
import { Layout } from './charting-layout';
export declare type ChartingThemeContextType = {
    theme: Layout;
    setTheme: (theme: Layout) => void;
};
export declare const useChartingThemeContext: () => ChartingThemeContextType;
export declare const ChartingThemeProvider: ({ children }: {
    children: React.ReactNode;
}) => JSX.Element;
//# sourceMappingURL=charting-theme-context.d.ts.map