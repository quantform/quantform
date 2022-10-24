import dynamic from 'next/dynamic';
import React, { ReactElement, useEffect } from 'react';

import { useLayoutStore, useSessionStore } from '../hooks';
import { LayoutModel } from '../models';
import { withAccordion } from './hoc';
import { BalanceList } from './SessionBalanceList';
import { OrderList } from './SessionOrderList';
import { PositionList } from './SessionPositionList';

const MeasurementViewDynamic = dynamic(() => import('./MeasurementView'), {
  loading: () => <p>Loading ...</p>,
  ssr: false
});

export type StudioProps = {
  layout: LayoutModel;
  children: ReactElement[];
};

export function Studio({ children, layout }: StudioProps) {
  const { setLayout, backgroundTopColor, borderColor, textColor } = useLayoutStore();

  useEffect(() => setLayout(layout), [layout, setLayout]);

  return (
    <div
      className="flex h-full flex-row"
      style={{ backgroundColor: backgroundTopColor, color: textColor }}
    >
      <div className="grow border-r" style={{ borderColor }}>
        <MeasurementViewDynamic></MeasurementViewDynamic>
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
