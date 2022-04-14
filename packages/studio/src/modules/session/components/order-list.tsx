import { Fragment } from 'react';
import { useChartingThemeContext } from '../../charting/charting-theme-context';
import { OrderSnapshot } from '../services/order-snapshot-context';

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);

  return date.toISOString().replace(/T/, ' ').replace(/\..+/, '');
}

export function OrderList({ orders }: { orders: OrderSnapshot[] }) {
  const { theme } = useChartingThemeContext();

  const tint = (order: OrderSnapshot) =>
    (order.side == 'BUY' ? theme.upColor : theme.downColor) ?? '#000000';

  return (
    <div className="flex overflow-auto whitespace-nowrap flex-col font-mono w-full h-full text-tiny text-slate-100">
      <table className="table-auto leading-4 w-full text-left">
        <tbody>
          {orders.map(order => (
            <Fragment key={order.key}>
              <tr className="border-zinc-700 border-t">
                <td className="px-3 pt-3 border-l-4" style={{ borderColor: tint(order) }}>
                  {order.instrument.toUpperCase()}
                </td>
                <td className="px-3 pt-3">
                  {order.side} {order.rate ? order.rate.toFixed(8) : ''}
                </td>
                <td className="px-3 pt-3 text-right">{order.quantity.toFixed(8)}</td>
              </tr>
              <tr className="opacity-50">
                <td className="px-3 pb-3 border-l-4" style={{ borderColor: tint(order) }}>
                  {formatTimestamp(order.timestamp)}
                </td>
                <td className="px-3 pb-3">
                  {order.state} {order.type}
                </td>
                <td className="px-3 pb-3 text-right">
                  {order.quantityExecuted.toFixed(8)}
                </td>
              </tr>
            </Fragment>
          ))}
        </tbody>
      </table>
      {!orders.length && (
        <div className="flex grow justify-center items-center w-full h-full border-zinc-700 border-t">
          <div className="grow opacity-30 uppercase text-center p-4">No orders</div>
        </div>
      )}
    </div>
  );
}
