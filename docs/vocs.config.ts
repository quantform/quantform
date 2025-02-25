import { defineConfig } from 'vocs';

export default defineConfig({
  rootDir: 'site',
  title: 'quantform',
  sidebar: [
    { text: 'Getting Started', link: '/getting-started' },
    { text: 'Example', link: '/example' },
    {
      text: 'Binance',
      items: [{ text: 'Usage', link: '/binance/usage' }],
      collapsed: true
    },
    {
      text: 'Solana',
      items: [{ text: 'Usage', link: '/binance/usage' }],
      collapsed: true
    },
    {
      text: 'Hyperliquid',
      items: [{ text: 'Usage', link: '/binance/usage' }],
      collapsed: true
    }
  ],
  theme: {
    accentColor: '#03d0eb'
  },
  font: {
    default: { google: 'Roboto' }
  },
  iconUrl: 'https://quantform.io/favicon.ico',
  logoUrl: {
    dark: 'https://quantform.io/quantform.svg',
    light: 'https://quantform.io/quantform.svg'
  }
});
