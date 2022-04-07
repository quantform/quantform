import { useBalanceSnapshotContext } from '../services/balance-snapshot-context';
import { groupBy } from 'ramda';

export function BalanceList() {
  const { snapshot } = useBalanceSnapshotContext();

  return (
    <div className="text-tiny font-mono w-full whitespace-nowrap text-slate-100">
      <table className="table-auto leading-7 w-full text-left">
        <thead className="opacity-50 uppercase">
          <tr>
            <th className="px-4 font-light">Asset</th>
            <th className="px-4 font-light">Free</th>
            <th className="px-4 font-light">Locked</th>
          </tr>
        </thead>

        <tbody>
          {Object.values(snapshot).map(balance => (
            <tr key={balance.key} className="text-white border-zinc-700 border-t">
              <td className="px-4">{balance.key.toUpperCase()}</td>
              <td className={`px-4 ${balance.free == 0 ? 'opacity-50' : ''}`}>
                {balance.free.toFixed(balance.scale)}
              </td>
              <td className={`px-4 ${balance.locked == 0 ? 'opacity-50' : ''}`}>
                {balance.locked.toFixed(balance.scale)}
              </td>
            </tr>
          ))}
        </tbody>

        <tbody></tbody>
      </table>
    </div>
  );
}
