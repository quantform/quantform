import { useEffect, useState } from 'react';
import { useOrderSnapshotContext } from '../services/order-snapshot-context';

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);

  return date.toISOString().replace(/T/, ' ').replace(/\..+/, '');
}

export function OrderList() {
  const { snapshot } = useOrderSnapshotContext();
  const [hasNotOrders, setHasNoOrders] = useState(false);

  useEffect(() => setHasNoOrders(Object.values(snapshot).length == 0), [snapshot]);

  return (
    <div className="flex overflow-auto whitespace-nowrap flex-col font-mono w-full h-full text-xs text-slate-100">
      <table className="table-auto leading-8 w-full text-left">
        <thead className="opacity-50 uppercase">
          <tr className="text-left">
            <th className="px-4 font-light">Instrument</th>
            <th className="px-4 font-light">Side</th>
            <th className="px-4 font-light">Rate</th>
            <th className="px-4 font-light">Qty</th>
            <th className="px-4 font-light">Qty Executed</th>
            <th className="px-4 font-light">State</th>
            <th className="px-4 font-light">Type</th>
            <th className="px-4 font-light">Created At</th>
          </tr>
        </thead>

        <tbody>
          {Object.values(snapshot).map(order => (
            <tr key={order.key} className="text-white border-zinc-700 border-t">
              <td className="px-4">{order.instrument.toUpperCase()}</td>
              <td className="px-4">{order.side}</td>
              <td className="px-4">{order.rate}</td>
              <td className="px-4">{order.quantity}</td>
              <td className="px-4">{order.quantityExecuted}</td>
              <td className="px-4">{order.state}</td>
              <td className="px-4">{order.type}</td>
              <td className="px-4">{formatTimestamp(order.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {hasNotOrders && (
        <div className="flex grow justify-center items-center w-full h-full border-zinc-700 border-t">
          <div className="grow opacity-30 uppercase text-center">No orders</div>
        </div>
      )}
    </div>
  );
}
