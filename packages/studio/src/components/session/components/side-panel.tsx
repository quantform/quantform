import React from 'react';

import { useSessionSnapshotContext } from '../session-snapshot-context';
import { BalanceList } from './balance-list';
import { OrderList } from './order-list';
import { PositionList } from './position-list';
import { Accordion } from './side-panel-accordion';

export function SidePanel() {
  const { balance, orders, positions } = useSessionSnapshotContext();

  return (
    <div className="flex flex-col grow overflow-x-scroll">
      <Accordion title="Funds">
        <BalanceList
          balances={Object.values(balance).sort(
            (lhs, rhs) => rhs.timestamp - lhs.timestamp
          )}
        ></BalanceList>
      </Accordion>
      <Accordion title="Orders">
        <OrderList
          orders={Object.values(orders).sort((lhs, rhs) => rhs.timestamp - lhs.timestamp)}
        ></OrderList>
      </Accordion>
      <Accordion title="Positions">
        <PositionList
          positions={Object.values(positions).sort(
            (lhs, rhs) => rhs.timestamp - lhs.timestamp
          )}
        ></PositionList>
      </Accordion>
    </div>
  );
}
