import { debounce } from 'lodash';
import dynamic from 'next/dynamic';
import React, { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';

import { ChartViewport, Layout, useChartingContext } from '../components/charting';
import { useChartingThemeContext } from '../components/charting/charting-theme-context';
import { SessionState, SidePanel } from '../components/session';
import { useSessionSnapshotContext } from '../components/session/session-snapshot-context';
import { getServerSession } from '../services/session-manager';

const ChartingView = dynamic(
  () => import('../components/charting/components/charting-view'),
  {
    loading: () => <p>Loading ...</p>,
    ssr: false
  }
);

export async function getServerSideProps() {
  const session = getServerSession();
  const { layout } = session.descriptor as any;

  return {
    props: { layout: JSON.parse(JSON.stringify(layout)) }
  };
}

export default function Home({ layout }: { layout: Layout }) {
  const session = useSessionSnapshotContext();
  const { measurement, dispatch } = useChartingContext();
  const { setTheme } = useChartingThemeContext();
  const [reconnection, setReconnection] = useState<number>(0);

  useEffect(() => setTheme(layout), [layout]);

  useEffect(() => {
    fetch('/api/ws').finally(() => {
      const socket = io();

      socket.on('disconnect', () => {
        socket.close();

        const inter = setInterval(() => {
          fetch('/api').then(it => {
            if (it.status === 200) {
              clearInterval(inter);
              window.location.reload();
            }
          });
        }, 1000);
      });

      socket.on('snapshot', snapshot =>
        session.dispatch({
          type: 'snapshot',
          ...snapshot
        })
      );

      socket.on('changes', changes => {
        session.dispatch({
          type: 'patch',
          ...changes.components
        });

        if (changes.measurements && Object.values(changes.measurements).length > 0) {
          dispatch({
            type: 'patch',
            payload: changes.measurements
          });
        }
      });
    });
  }, [reconnection]);

  useEffect(() => {
    fetch(`/api/measurement/chunk`).then(it =>
      it.json().then(it => dispatch({ type: 'snapshot', payload: it }))
    );
  }, []);

  const viewportHandler = (viewport: ChartViewport) => {
    if (viewport.requiresBackward) {
      fetch(`/api/measurement/chunk?to=${viewport.from * 1000}`).then(it =>
        it.json().then(it => dispatch({ type: 'merge', payload: it }))
      );
    }
  };

  const debouncedChangeHandler = useMemo(() => debounce(viewportHandler, 300), []);

  useEffect(
    () => () => {
      debouncedChangeHandler.cancel();
    },
    []
  );

  return (
    <div
      className={`flex flex-col  h-screen bg-zinc-800 text-white`}
      style={{ backgroundColor: layout.backgroundTopColor }}
    >
      <div className="flex h-full flex-row">
        <div className="grow border-zinc-700 border-r-4">
          <ChartingView
            layout={layout}
            measurement={measurement}
            viewportChanged={debouncedChangeHandler}
          ></ChartingView>
        </div>
        <div className="flex flex-col w-96">
          <SidePanel></SidePanel>
        </div>
      </div>
      <div className="border-zinc-700 border-t-4">
        <SessionState></SessionState>
      </div>
    </div>
  );
}
