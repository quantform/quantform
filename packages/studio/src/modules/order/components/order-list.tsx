import { useEffect, useState } from 'react';
import { useOrderSnapshotContext } from '../services/order-snapshot-context';

export function OrderList() {
  const { snapshot } = useOrderSnapshotContext();
  const [hasNotOrders, setHasNoOrders] = useState(false);

  useEffect(() => setHasNoOrders(Object.values(snapshot).length == 0), [snapshot]);

  return (
    <div className="font-mono w-full h-full text-xs text-slate-100">
      <table className="table-auto leading-8 w-full text-left">
        <thead className="opacity-50 uppercase">
          <tr className="text-left">
            <th className="px-4 font-light">Instrument</th>
            <th className="px-4 font-light">Side</th>
            <th className="px-4 font-light">State</th>
            <th className="px-4 font-light">Quantity</th>
            <th className="px-4 font-light">Quantity Executed</th>
            <th className="px-4 font-light">Type</th>
            <th className="px-4 font-light">Created At</th>
          </tr>
        </thead>

        <tbody>
          {Object.values(snapshot).map(order => (
            <tr key={order.key} className="text-white border-zinc-700 border-t">
              <td className="px-4">{order.instrument.toUpperCase()}</td>
              <td className="px-4">{order.side}</td>
              <td className="px-4">{order.state}</td>
              <td className="px-4">{order.quantity}</td>
              <td className="px-4">{order.quantityExecuted}</td>
              <td className="px-4">{order.type}</td>
              <td className="px-4">{order.createdAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {hasNotOrders && (
        <div className="flex justify-center items-center uppercase opacity-30 w-full h-full">
          <p>No orders</p>
        </div>
      )}
    </div>
  );
}
