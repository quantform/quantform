import { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { getSession } from '../modules/session/session-accessor';
import dynamic from 'next/dynamic';
import {
  appendLayoutProps,
  LayoutProps
} from '../modules/measurement/services/measurement-transformer';
import {
  useBalanceSnapshotContext,
  useOrderSnapshotContext
} from '../modules/session/services';
import { BalanceList, OrderList, PositionList } from '../modules/session/components';
import { useMeasurementContext } from '../modules/measurement/services/measurement-context';
import { ChartViewport } from '../modules/tradingview/components/trading-view';
import { Measurement } from '@quantform/core';
import { Layout } from '../modules/measurement/layout';
import { debounce } from 'lodash';

const TradingView = dynamic(
  () => import('../modules/tradingview/components/trading-view'),
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
  const { measurement, dispatch } = useMeasurementContext();

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

  const merge = (toAppend: LayoutProps) => {
    return measurement;
  };

  const viewportHandler = (viewport: ChartViewport) => {
    console.log(viewport);
    if (viewport.requiresBackward) {
      fetch(`/api/measurement/chunk?to=${viewport.from * 1000}`).then(it =>
        it.json().then(it => console.log(it))
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
      className={`flex flex-col bg-zinc-800 text-white`}
      style={{ backgroundColor: layout.backgroundBottomColor }}
    >
      <div className="flex flex-row h-full">
        <div className="flex flex-col h-screen w-10/12 border-zinc-400 border-r">
          <div className="flex-grow">
            <TradingView
              layout={layout}
              measurement={measurement}
              viewportChanged={debouncedChangeHandler}
            ></TradingView>
          </div>
          <div className="flex border-zinc-400 border-t h-52">
            <div className="w-1/2 border-zinc-400 border-r">
              <OrderList></OrderList>
            </div>
            <div className="w-1/2">
              <PositionList></PositionList>
            </div>
          </div>
        </div>
        <div className="flex w-2/12">
          <div className="w-full">
            <BalanceList></BalanceList>
          </div>
        </div>
      </div>
    </div>
  );
}
