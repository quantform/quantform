import type { GetServerSideProps, NextPage } from 'next';
import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { BalanceTable } from '../components/balance';
import { OrderTable } from '../components/orders';
import {
  useBalanceContext,
  useOrderContext,
  useSessionBalanceContext
} from '../components/session-context';

import sessionAccessor from './../session';

export const getServerSideProps: GetServerSideProps = async context => {
  const orderbook = Object.values(
    sessionAccessor.session?.store.snapshot.orderbook ?? {}
  ).map(it => ({
    ...it,
    instrument: it.instrument.toString()
  }));

  return {
    props: { sessionId: orderbook }
  };
  // ...
};

export default function Home(props: { sessionId: number }) {
  const balance = useBalanceContext();
  const order = useOrderContext();

  useEffect(() => {
    fetch('/api/ws').finally(() => {
      const socket = io();

      socket.on('connect', () => {
        console.log('connect');
        socket.emit('hello');
      });

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
        if (patch.balance) {
          balance.dispatch({ type: 'patch', elements: [patch.balance] });
        }

        if (patch.order) {
          order.dispatch({ type: 'patch', elements: [patch.order] });
        }

        console.log('patch', patch);
      });

      socket.on('disconnect', () => {
        console.log('disconnect');
      });
    });
  }, []); // Added [] as useEffect filter so it will be executed only once, when component is mounted

  return (
    <div className="flex flex-col h-screen">
      <div className="bg-yellow-500 py-8 hidden sm:block ">
        <div className="flex space-x-4">
          <BalanceTable></BalanceTable>
          <OrderTable></OrderTable>
        </div>
      </div>

      <div className="bg-green-500 flex flex-grow">
        This is the other content on screen
      </div>
    </div>
  );
}
