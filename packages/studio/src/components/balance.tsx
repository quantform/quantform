import { useBalanceContext } from './session-context';
import { groupBy } from 'ramda';

export function BalanceTable() {
  const { snapshot } = useBalanceContext();

  return (
    <div className="font-mono max-w-lg mx-auto p-8">
      <details
        className="open:bg-white dark:open:bg-slate-900 open:ring-1 open:ring-black/5 dark:open:ring-white/10 open:shadow-lg p-6 rounded-lg"
        open
      >
        <summary className="text-sm leading-6 text-slate-900 dark:text-white font-semibold select-none">
          Balances
        </summary>
        <div className="mt-3 text-xs leading-6 text-slate-600 dark:text-slate-400">
          <table className="table-fixed">
            <thead>
              <tr>
                <th>Asset</th>
                <th>Free</th>
                <th>Locked</th>
              </tr>
            </thead>

            {Object.entries(groupBy(x => x.adapter, Object.values(snapshot))).map(
              ([adapter, assets]) => (
                <tbody key={adapter}>
                  <tr>
                    <th colSpan={3}>{adapter.toUpperCase()}</th>
                  </tr>
                  {assets.map(asset => (
                    <tr key={`${adapter}-${asset.asset}`} className="text-white">
                      <td>{asset.asset.toUpperCase()}</td>
                      <td className="px-4">{asset.free.toFixed(asset.scale)}</td>
                      <td>{asset.locked.toFixed(asset.scale)}</td>
                    </tr>
                  ))}
                </tbody>
              )
            )}

            <tbody></tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
