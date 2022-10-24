import React, { Fragment } from 'react';

import { useLayoutStore } from '../hooks';
import { SessionOrderModel } from '../models';

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);

  return date.toISOString().replace(/T/, ' ').replace(/\..+/, '');
}

export function OrderList({ orders }: { orders: SessionOrderModel[] }) {
  const { downColor, upColor } = useLayoutStore();
  const { borderColor } = useLayoutStore();

  const tint = (order: SessionOrderModel) =>
    (order.isBuy ? upColor : downColor) ?? '#000000';

  const dimmed = (order: SessionOrderModel) =>
    order.state != 'NEW' && order.state != 'PENDING';

  return (
    <div className="flex flex-col whitespace-nowrap font-mono w-full h-full text-tiny">
      <table className="table-auto leading-4 w-full text-left">
        <tbody>
          {orders.map(order => (
            <Fragment key={order.key}>
              <tr
                className={`border-t first:border-t-0 ${
                  dimmed(order) ? 'opacity-50' : 'opacity-100'
                }`}
                style={{ borderColor }}
              >
                <td className="px-3 pt-3 border-l-4" style={{ borderColor: tint(order) }}>
                  {order.instrument.toUpperCase()}
                </td>
                <td className="px-3 pt-3">
                  {order.averageExecutionRate ?? order.rate ?? ''}
                </td>
                <td className="px-3 pt-3 text-right">{order.quantity}</td>
              </tr>
              <tr className="opacity-50">
                <td className="px-3 pb-3 border-l-4" style={{ borderColor: tint(order) }}>
                  {formatTimestamp(order.timestamp)}
                </td>
                <td className="px-3 pb-3">{order.state}</td>
                <td className="px-3 pb-3 text-right">{order.quantityExecuted}</td>
              </tr>
            </Fragment>
          ))}
        </tbody>
      </table>
      {!orders.length && (
        <div className="flex grow justify-center items-center w-full h-full">
          <div className="grow opacity-30 uppercase text-center p-4">No orders</div>
        </div>
      )}
    </div>
  );
}
