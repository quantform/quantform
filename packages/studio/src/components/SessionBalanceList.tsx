import React, { Fragment } from 'react';

import { useLayoutStore } from '../hooks';
import { SessionBalanceModel } from '../models';

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);

  return date.toISOString().replace(/T/, ' ').replace(/\..+/, '');
}

export function BalanceList({ balances }: { balances: SessionBalanceModel[] }) {
  const { borderColor } = useLayoutStore();

  return (
    <div className="flex flex-col text-tiny font-mono w-full h-full whitespace-nowrap">
      <table className="table-auto leading-4 w-full text-left">
        <tbody>
          {balances.map(balance => (
            <Fragment key={balance.key}>
              <tr className="border-t first:border-t-0" style={{ borderColor }}>
                <td className="px-3 pt-3">{balance.key.toUpperCase()}</td>
                <td className="px-3 pt-3 text-right">{balance.free}</td>
              </tr>
              <tr className="opacity-50">
                <td className="px-3 pb-3">{formatTimestamp(balance.timestamp)}</td>
                <td className="px-3 pb-3 text-right">{balance.locked}</td>
              </tr>
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
