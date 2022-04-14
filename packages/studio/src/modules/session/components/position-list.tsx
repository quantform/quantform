import { PositionSnapshot } from '../services/position-snapshot-context';

export function PositionList({ positions }: { positions: PositionSnapshot[] }) {
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
          {positions.map(positions => (
            <tr key={positions.key} className="text-white border-zinc-700 border-t">
              <td className="px-4">{positions.instrument.toUpperCase()}</td>
              <td className="px-4">{positions.size}</td>
              <td className="px-4">{positions.averageExecutionRate}</td>
              <td className="px-4">{positions.leverage}</td>
              <td className="px-4">{positions.mode}</td>
              <td className="px-4">{positions.estimatedUnrealizedPnL}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {!positions.length && (
        <div className="flex grow justify-center items-center w-full h-full border-zinc-700 border-t">
          <div className="grow opacity-30 uppercase text-center p-4">
            No open positions
          </div>
        </div>
      )}
    </div>
  );
}
