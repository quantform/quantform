import React from 'react';

import { Studio } from '../components/session/components/studio';

export async function getServerSideProps() {
  return { props: {} };
}

export default function Home() {
  return (
    <div className={`flex flex-col h-screen bg-zinc-800 text-white`}>
      <Studio>
        <Studio.BalanceList key="balance" balances={[]}></Studio.BalanceList>
        <Studio.OrderList key="order" orders={[]}></Studio.OrderList>
        <Studio.PositionList key="position" positions={[]}></Studio.PositionList>
      </Studio>
    </div>
  );
}
