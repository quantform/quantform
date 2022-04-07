import { useEffect, useState } from 'react';
import { usePositionSnapshotContext } from '../services/position-snapshot-context';

export function PositionList() {
  const { snapshot } = usePositionSnapshotContext();
  const [hasNotPositions, setHasNoPositions] = useState(false);

  useEffect(() => setHasNoPositions(Object.values(snapshot).length == 0), [snapshot]);

  return (
    <div className="flex overflow-auto whitespace-nowrap flex-col font-mono w-full h-full text-tiny text-slate-100">
      <table className="table-auto leading-7 w-full text-left">
        <thead className="opacity-50 uppercase">
          <tr className="text-left">
            <th className="px-4 font-light">Instrument</th>
            <th className="px-4 font-light">Size</th>
            <th className="px-4 font-light">Average Execution Rate</th>
            <th className="px-4 font-light">Leverage</th>
            <th className="px-4 font-light">Mode</th>
            <th className="px-4 font-light">PnL</th>
          </tr>
        </thead>

        <tbody>
          {Object.values(snapshot).map(order => (
            <tr key={order.key} className="text-white border-zinc-700 border-t">
              <td className="px-4">{order.instrument.toUpperCase()}</td>
              <td className="px-4">{order.size}</td>
              <td className="px-4">{order.averageExecutionRate}</td>
              <td className="px-4">{order.leverage}</td>
              <td className="px-4">{order.mode}</td>
              <td className="px-4">{order.estimatedUnrealizedPnL}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {hasNotPositions && (
        <div className="flex grow justify-center items-center w-full h-full border-zinc-700 border-t">
          <div className="grow opacity-30 uppercase text-center">No open positions</div>
        </div>
      )}
    </div>
  );
}
