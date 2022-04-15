import { Fragment } from 'react';
import { BalanceSnapshot } from '../session-snapshot-models';

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);

  return date.toISOString().replace(/T/, ' ').replace(/\..+/, '');
}

export function BalanceList({ balances }: { balances: BalanceSnapshot[] }) {
  return (
    <div className="flex flex-col text-tiny font-mono w-full h-full whitespace-nowrap text-slate-100">
      <table className="table-auto leading-4 w-full text-left">
        <tbody>
          {balances.map(balance => (
            <Fragment key={balance.key}>
              <tr className="border-zinc-700 border-t first:border-t-0">
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
