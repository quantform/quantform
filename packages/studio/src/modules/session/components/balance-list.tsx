import { BalanceSnapshot } from '../services/balance-snapshot-context';
import { Fragment } from 'react';

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);

  return date.toISOString().replace(/T/, ' ').replace(/\..+/, '');
}

export function BalanceList({ balances }: { balances: BalanceSnapshot[] }) {
  return (
    <div className="text-tiny font-mono w-full whitespace-nowrap text-slate-100">
      <table className="table-auto leading-4 w-full text-left">
        <tbody>
          {balances.map(balance => (
            <Fragment key={balance.key}>
              <tr className="border-zinc-700 border-t">
                <td className="px-3 pt-3">{balance.key.toUpperCase()}</td>
                <td className="px-3 pt-3 text-right">{balance.free.toFixed(8)}</td>
              </tr>
              <tr className="opacity-50">
                <td className="px-3 pb-3">{formatTimestamp(balance.timestamp)}</td>
                <td className="px-3 pb-3 text-right">{balance.locked.toFixed(8)}</td>
              </tr>
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
