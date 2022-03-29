import { useOrderContext } from './session-context';

export function OrderTable() {
  const { snapshot } = useOrderContext();

  return (
    <div className="font-mono max-w-lg mx-auto p-8">
      <details
        className="open:bg-white dark:open:bg-slate-900 open:ring-1 open:ring-black/5 dark:open:ring-white/10 open:shadow-lg p-6 rounded-lg"
        open
      >
        <summary className="text-sm leading-6 text-slate-900 dark:text-white font-semibold select-none">
          Orders
        </summary>
        <div className="mt-3 text-xs leading-6 text-slate-600 dark:text-slate-400">
          <table className="table-fixed">
            <thead>
              <tr className="text-left">
                <th>Instrument</th>
                <th>Side</th>
                <th>State</th>
                <th>Quantity</th>
              </tr>
            </thead>

            <tbody>
              {Object.values(snapshot).map(order => (
                <tr key={order.key} className="text-white">
                  <td className="pr-4">{order.instrument.toUpperCase()}</td>
                  <td className="pr-4">{order.side}</td>
                  <td className="pr-4">{order.state}</td>
                  <td>{order.quantity}</td>
                </tr>
              ))}
            </tbody>

            <tbody></tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
