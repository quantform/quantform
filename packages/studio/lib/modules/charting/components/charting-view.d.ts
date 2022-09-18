/// <reference types="react" />
import { Layout, LayoutProps } from '../charting-layout';
import { ISeriesApi } from 'lightweight-charts';
export declare class ChartViewport {
    private readonly barsBefore;
    private readonly barsAfter;
    readonly from: number;
    readonly to: number;
    constructor(barsBefore: number, barsAfter: number, from: number, to: number);
    get requiresBackward(): boolean | 0;
    get requiresForward(): boolean | 0;
}
export declare type ChartSeries = Record<string, ISeriesApi<any>>;
export default function ChartingView(props: {
    measurement: {
        snapshot: LayoutProps;
        patched: LayoutProps;
    };
    layout: Layout;
    viewportChanged?: (viewport: ChartViewport) => void;
}): JSX.Element;
//# sourceMappingURL=charting-view.d.ts.map