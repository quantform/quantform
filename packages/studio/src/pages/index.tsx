import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { BalanceList } from '../modules/balance/components';
import { OrderList } from '../modules/order/components';
import { useBalanceSnapshotContext } from '../modules/balance/service';
import { useOrderSnapshotContext } from '../modules/order/services';

export async function getServerSideProps() {
  return {
    props: { layout: {} }
  };
}

export default function Home({ layout }) {
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

        console.log('snapshot', snapshot);
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

        console.log('patch', patch);
      });
    });
  }, []);

  return (
    <div className="flex flex-row bg-zinc-800 text-white">
      <div className="flex flex-col h-screen w-full border-zinc-400 border-r-4">
        <div className="flex-grow"></div>
        <div className="flex border-zinc-400 border-t-4 h-52">
          <OrderList></OrderList>
        </div>
      </div>
      <div className="flex flex-col flex-grow w-96">
        <div className="w-full">
          <BalanceList></BalanceList>
        </div>
      </div>
    </div>
  );
}
