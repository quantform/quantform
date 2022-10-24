import React from 'react';

import { useLayoutStore } from '../hooks';
import { SessionPositionModel } from '../models';

export function PositionList({ positions }: { positions: SessionPositionModel[] }) {
  const { borderColor } = useLayoutStore();

  return (
    <div className="flex flex-col whitespace-nowrap font-mono w-full h-full text-tiny text-slate-100">
      <table className="table-auto leading-7 w-full text-left">
        <tbody>
          {positions.map(position => (
            <tr
              key={position.key}
              className="text-white border-t first:border-t-0"
              style={{ borderColor }}
            >
              <td className="px-4">{position.instrument.toUpperCase()}</td>
              <td className="px-4">{position.size}</td>
              <td className="px-4">{position.averageExecutionRate}</td>
              <td className="px-4">{position.leverage}</td>
              <td className="px-4">{position.mode}</td>
              <td className="px-4">{position.estimatedUnrealizedPnL}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {!positions.length && (
        <div className="flex grow justify-center items-center w-full h-full">
          <div className="grow opacity-30 uppercase text-center p-4">
            No open positions
          </div>
        </div>
      )}
    </div>
  );
}
