import { useBalanceSnapshotContext } from '../service/balance-snapshot-context';
import { groupBy } from 'ramda';

export function BalanceList() {
  const { snapshot } = useBalanceSnapshotContext();

  return (
    <div className="font-mono w-full text-xs text-slate-100">
      <table className="table-auto leading-8 w-full text-left">
        <thead className="border-zinc-400 border-b">
          <tr>
            <th className="px-4">Asset</th>
            <th className="px-4">Free</th>
            <th className="px-4">Locked</th>
          </tr>
        </thead>

        <tbody>
          {Object.values(snapshot).map(balance => (
            <tr key={balance.key} className="text-white border-zinc-700 border-b">
              <td className="px-4">{balance.key.toUpperCase()}</td>
              <td className="px-4">{balance.free.toFixed(balance.scale)}</td>
              <td className="px-4">{balance.locked.toFixed(balance.scale)}</td>
            </tr>
          ))}
        </tbody>

        <tbody></tbody>
      </table>
    </div>
  );
}
