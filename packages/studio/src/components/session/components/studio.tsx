import React, { ReactElement } from 'react';

import { BalanceList } from './balance-list';
import { OrderList } from './order-list';
import { PositionList } from './position-list';
import { Accordion } from './side-panel-accordion';

export type StudioProps = {
  children: ReactElement<{ title: string }>[];
};

export function Studio({ children }: StudioProps) {
  return (
    <div className="flex h-full flex-row">
      <div className="grow border-zinc-700 border-r-2"></div>
      <div className="flex flex-col w-96">
        <div className="flex flex-col grow overflow-x-scroll">
          {children.map(it => (
            <Accordion title={it.props.title ?? 'no-name'} key={it.key}>
              {it}
            </Accordion>
          ))}
        </div>
      </div>
    </div>
  );
}

Studio.BalanceList = BalanceList;
Studio.OrderList = OrderList;
Studio.PositionList = PositionList;
