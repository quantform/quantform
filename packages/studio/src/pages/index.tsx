import React from 'react';

import { Layout } from '../components/charting';
import { Studio } from '../components/session/components/studio';

export async function getServerSideProps() {
  const layout: Layout = {
    children: [],
    backgroundTopColor: '#000000',
    backgroundBottomColor: '#000000'
  };

  return { props: { layout } };
}

export default function Home({ layout }: { layout: Layout }) {
  return (
    <div className={`flex flex-col h-screen bg-zinc-800 text-white`}>
      <Studio layout={layout}>
        <Studio.BalanceList></Studio.BalanceList>
        <Studio.OrderList></Studio.OrderList>
        <Studio.PositionList></Studio.PositionList>
      </Studio>
    </div>
  );
}
