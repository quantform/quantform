import React, { useEffect } from 'react';

import { Studio } from '../components';
import { useServerStreaming } from '../hooks';
import { useAppStore } from '../hooks/useAppStore';
import { LayoutModel } from '../models';
import { getSessionContext } from '../services';

export async function getServerSideProps() {
  const { layout, title } = getSessionContext();

  return { props: { layout: JSON.parse(JSON.stringify(layout)), title } };
}

export default function Home({ layout, title }: { layout: LayoutModel; title: string }) {
  const { setTitle } = useAppStore();

  useEffect(() => setTitle(title), [title, setTitle]);

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
