import { useOrderSnapshotContext } from '../services/order-snapshot-context';

export function OrderList() {
  const { snapshot } = useOrderSnapshotContext();

  return (
    <div className="font-mono w-full text-xs text-slate-100">
      <table className="table-auto leading-8 w-full text-left">
        <thead className="border-zinc-400 border-b-2">
          <tr className="text-left">
            <th className="px-4">Instrument</th>
            <th className="px-4">Side</th>
            <th className="px-4">State</th>
            <th className="px-4">Quantity</th>
            <th className="px-4">Quantity Executed</th>
            <th className="px-4">Type</th>
            <th className="px-4">Created At</th>
          </tr>
        </thead>

        <tbody>
          {Object.values(snapshot).map(order => (
            <tr key={order.key} className="text-white border-zinc-700 border-b">
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

        <tbody></tbody>
      </table>
    </div>
  );
}
