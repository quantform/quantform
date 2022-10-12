import React from 'react';

import { getStudyLayout } from '..';
import { Studio } from '../components';
import { useServerStreaming } from '../hooks';
import { LayoutModel } from '../models';

export async function getServerSideProps() {
  const layout = getStudyLayout();

  return { props: { layout: JSON.parse(JSON.stringify(layout)) } };
}

export default function Home({ layout }: { layout: LayoutModel }) {
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
