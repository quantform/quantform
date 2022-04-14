import { useEffect, useMemo } from 'react';
import { io } from 'socket.io-client';
import { getSession } from '../modules/session/session-accessor';
import dynamic from 'next/dynamic';
import {
  useBalanceSnapshotContext,
  useOrderSnapshotContext
} from '../modules/session/services';
import { SessionState, SidePanel } from '../modules/session/components';
import { useChartingContext } from '../modules/charting/charting-context';
import { ChartViewport } from '../modules/charting/components/charting-view';
import { debounce } from 'lodash';
import { Layout } from '../modules/charting';
import { useChartingThemeContext } from '../modules/charting/charting-theme-context';

const ChartingView = dynamic(
  () => import('../modules/charting/components/charting-view'),
  {
    loading: () => <p>Loading ...</p>,
    ssr: false
  }
);

export async function getServerSideProps() {
  const session = getSession();
  const { layout } = session.descriptor as any;

  return {
    props: { layout: JSON.parse(JSON.stringify(layout)) }
  };
}

export default function Home({ layout }: { layout: Layout }) {
  const balance = useBalanceSnapshotContext();
  const order = useOrderSnapshotContext();
  const { measurement, dispatch } = useChartingContext();
  const { setTheme } = useChartingThemeContext();

  useEffect(() => setTheme(layout), [layout]);

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

      socket.on('changes', changes => {
        for (const component of changes.components) {
          switch (component.kind) {
            case 'balance':
              balance.dispatch({ type: 'patch', elements: [component] });
              break;
            case 'order':
              order.dispatch({ type: 'patch', elements: [component] });
              break;
          }
        }

        if (changes.measurements && Object.values(changes.measurements).length > 0) {
          dispatch({
            type: 'patch',
            payload: changes.measurements
          });
        }
      });
    });
  }, []);

  useEffect(() => {
    fetch(`/api/measurement/chunk`).then(it =>
      it.json().then(it => dispatch({ type: 'snapshot', payload: it }))
    );
  }, []);

  const viewportHandler = (viewport: ChartViewport) => {
    console.log(viewport);
    if (viewport.requiresBackward) {
      fetch(`/api/measurement/chunk?to=${viewport.from * 1000}`).then(it =>
        it.json().then(it => dispatch({ type: 'merge', payload: it }))
      );
    }
  };

  const debouncedChangeHandler = useMemo(() => debounce(viewportHandler, 300), []);

  useEffect(() => {
    return () => {
      debouncedChangeHandler.cancel();
    };
  }, []);

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
        <div className="flex flex-col overflow-y-scroll w-96">
          <SidePanel></SidePanel>
        </div>
      </div>
      <div className="border-zinc-700 border-t-4">
        <SessionState></SessionState>
      </div>
    </div>
  );
}
