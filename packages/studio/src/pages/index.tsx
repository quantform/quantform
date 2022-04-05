import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { BalanceList } from '../modules/balance/components';
import { OrderList } from '../modules/order/components';
import { useBalanceSnapshotContext } from '../modules/balance/service';
import { useOrderSnapshotContext } from '../modules/order/services';
import { getSession } from '../modules/session/session-accessor';
import dynamic from 'next/dynamic';
import { SessionState } from '../modules/session/components/session-state';
import { LayoutProps } from '../modules/measurement/services/measurement-transformer';

const TradingView = dynamic(
  () => import('../modules/tradingview/components/tradingview'),
  {
    loading: () => <p>Loading ...</p>,
    ssr: false
  }
);

export async function getServerSideProps() {
  const session = getSession();
  const { layout } = session.descriptor as any;

  return {
    props: { jsonLayout: JSON.stringify(layout) }
  };
}

export default function Home({ jsonLayout }) {
  const layout = JSON.parse(jsonLayout);
  const balance = useBalanceSnapshotContext();
  const order = useOrderSnapshotContext();

  useEffect(() => {
    fetch('/api/ws').finally(() => {
      const socket = io();

      socket.on('snapshot', snapshot => {
        if (snapshot.balance) {
          balance.dispatch({ type: 'snapshot', elements: snapshot.balance });
        }

        if (snapshot.orders) {
          order.dispatch({ type: 'snapshot', elements: snapshot.orders });
        }
      });

      socket.on('patch', patch => {
        for (const component of patch) {
          switch (component.kind) {
            case 'balance':
              balance.dispatch({ type: 'patch', elements: [component] });
              break;
            case 'order':
              order.dispatch({ type: 'patch', elements: [component] });
              break;
          }
        }
      });
    });
  }, []);

  const [measurement, setMeasurement] = useState<LayoutProps>({});

  useEffect(() => {
    fetch('/api/measurement/chunk?from=0&to=2648794600000').then(it =>
      it.json().then(it => setMeasurement(it))
    );
  }, []);

  return (
    <div
      className={`flex flex-col bg-zinc-800 text-white`}
      style={{ backgroundColor: layout.backgroundBottomColor }}
    >
      <div className="flex flex-row h-full">
        <div className="flex flex-col h-screen w-full border-zinc-400 border-r">
          <div className="flex-grow">
            <TradingView layout={layout} measurement={measurement}></TradingView>
          </div>
          <div className="flex border-zinc-400 border-t h-52">
            <div className="w-1/2 border-zinc-400 border-r">
              <OrderList></OrderList>
            </div>
            <div className="w-1/2">
              <OrderList></OrderList>
            </div>
          </div>
        </div>
        <div className="flex flex-col flex-grow w-96">
          <div className="w-full">
            <BalanceList></BalanceList>
          </div>
        </div>
      </div>
    </div>
  );
}
