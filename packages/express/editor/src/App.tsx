import React from 'react';

import { Quantform, QuantformTemplate } from '@quantform/editor-react-component';
import { ExpressMeasureProvider } from './measure-provider';

const style: QuantformTemplate = {
  charts: [
    {
      weight: 5,
      backgroundColor: '#282a36',
      textColor: '#fff',
      borderColor: '#3e404a',
      series: [
        {
          name: 'xy',
          key: 'envelope',
          type: 'LINE',
          color: '#0fF',
          priceScale: 5,
          transform: (x: any) => x['upper'],
          markers: [
            {
              key: 'order-sell',
              color: '#0fF',
              position: 'aboveBar',
              shape: 'arrowDown',
              text: (x: any) => `SELL @ ${x.rate.toFixed(4)}`
            }
          ]
        },
        {
          name: 'xdy',
          key: 'envelope',
          type: 'LINE',
          color: '#0F0',
          priceScale: 5,
          transform: (x: any) => x['lower'],
          markers: [
            {
              key: 'order-buy',
              color: '#0F0',
              position: 'belowBar',
              shape: 'arrowUp',
              text: (x: any) => `BUY @ ${x.rate.toFixed(4)}`
            }
          ]
        },
        {
          name: 'sddsf',
          key: 'envelope-candle',
          type: 'CANDLE',
          color: '#fF0',
          priceScale: 5,
          transform: (x: any) => x
        }
      ]
    },
    {
      weight: 2,
      backgroundColor: '#282a36',
      textColor: '#fff',
      borderColor: '#3e404a',
      series: [
        {
          name: 'xy',
          key: 'envelope',
          type: 'LINE',
          color: '#0fF',
          priceScale: 5,
          transform: (x: any) => x['upper']
        }
      ]
    },
    {
      weight: 2,
      backgroundColor: '#282a36',
      textColor: '#fff',
      borderColor: '#3e404a',
      series: [
        {
          name: 'xy',
          key: 'order-buy',
          type: 'LINE',
          color: '#0fF',
          priceScale: 5,
          transform: (x: any) => x['rate']
        }
      ]
    }
  ]
};

const App = () => {
  const url = decodeURIComponent(window.location.pathname).split('/');
  const session = Number(url[url.length - 1]);
  const descriptor = url[url.length - 2];

  //'2021-04-11 19:46:22'
  //'stable-reversion'
  const provider = new ExpressMeasureProvider(
    window.location.origin,
    session,
    descriptor
  );

  return <Quantform provider={provider} template={style} />;
};

export default App;
