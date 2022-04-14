import {
  useBalanceSnapshotContext,
  useOrderSnapshotContext,
  usePositionSnapshotContext
} from '../services';
import { BalanceList } from './balance-list';
import { OrderList } from './order-list';
import { PositionList } from './position-list';
import { Accordion } from './side-panel-accordion';

export function SidePanel() {
  const balance = useBalanceSnapshotContext();
  const orders = useOrderSnapshotContext();
  const positions = usePositionSnapshotContext();

  return (
    <>
      <Accordion title="Funds">
        <BalanceList balances={Object.values(balance.snapshot)}></BalanceList>
      </Accordion>
      <Accordion title="Orders">
        <OrderList orders={Object.values(orders.snapshot)}></OrderList>
      </Accordion>
      <Accordion title="Positions">
        <PositionList positions={Object.values(positions.snapshot)}></PositionList>
      </Accordion>
    </>
  );
}
