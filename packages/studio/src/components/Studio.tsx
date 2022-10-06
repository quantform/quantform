import dynamic from 'next/dynamic';
import React, { ReactElement, useEffect } from 'react';

import { useSessionStore } from '../hooks';
import { BalanceList } from './BalanceList';
import { Layout, useLayoutStore } from './charting';
import { withAccordion } from './hoc';
import { OrderList } from './OrderList';
import { PositionList } from './PositionList';

const ChartingView = dynamic(() => import('./charting/components/charting-view'), {
  loading: () => <p>Loading ...</p>,
  ssr: false
});

export type StudioProps = {
  layout: Layout;
  children: ReactElement[];
};

export function Studio({ children, layout }: StudioProps) {
  const { setLayout } = useLayoutStore();

  useEffect(() => setLayout(layout), [layout, setLayout]);

  return (
    <div
      className="flex h-full flex-row"
      style={{ backgroundColor: layout.backgroundTopColor }}
    >
      <div className="grow border-zinc-700 border-r-2">
        <ChartingView
          layout={layout}
          measurement={{ patched: {}, snapshot: {} }}
        ></ChartingView>
      </div>
      <div className="flex flex-col w-96">
        <div className="flex flex-col grow overflow-x-scroll">
          {children.map(it => it)}
        </div>
      </div>
    </div>
  );
}

function BalanceWithAccordion() {
  const { balances } = useSessionStore();

  const List = withAccordion(() => <BalanceList balances={balances}></BalanceList>);

  return <List title="Balance" key="balance"></List>;
}

function OrderWithAccordion() {
  const { orders } = useSessionStore();

  const List = withAccordion(() => <OrderList orders={orders}></OrderList>);

  return <List title="Order" key="order"></List>;
}

function PositionWithAccordion() {
  const { positions } = useSessionStore();

  const List = withAccordion(() => <PositionList positions={positions}></PositionList>);

  return <List title="Position" key="position"></List>;
}

Studio.BalanceList = BalanceWithAccordion;
Studio.OrderList = OrderWithAccordion;
Studio.PositionList = PositionWithAccordion;
