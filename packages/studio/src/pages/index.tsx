import React from 'react';

import { Studio } from '../components';
import { Layout, linear, pane } from '../components/charting';
import { useServerStreaming } from '../hooks';

export async function getServerSideProps() {
  const layout: Layout = {
    children: [
      pane({
        children: [
          linear({
            kind: 'test',
            scale: 1,
            map: measure => measure.x
          })
        ]
      }),
      pane({
        children: [
          linear({
            kind: 'test',
            scale: 1,
            map: measure => measure.x
          })
        ]
      })
    ]
  };

  return { props: { layout: JSON.parse(JSON.stringify(layout)) } };
}

export default function Home({ layout }: { layout: Layout }) {
  useServerStreaming();

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
