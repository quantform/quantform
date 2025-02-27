import { defineConfig } from 'vocs';

export default defineConfig({
  rootDir: 'site',
  title: 'quantform',
  sidebar: [
    { text: 'Deploy a Bot', link: '/getting-started' },
    { text: 'Autonomous Market Agents', link: '/getting-started' },
    { text: 'Dependency Injection and Context', link: '/getting-started' },
    { text: 'Composition and Hooks', link: '/getting-started' },
    { text: 'Example', link: '/example' },
    {
      text: 'Binance',
      items: [{ text: 'Usage', link: '/binance/usage' }],
      collapsed: true
    },
    {
      text: 'Solana',
      items: [
        { text: 'Usage', link: '/solana/usage' },
        { text: 'Reference', link: '/solana/reference' }],
      collapsed: true
    },
    {
      text: 'Hyperliquid',
      items: [{ text: 'Usage', link: '/binance/usage' }],
      collapsed: true
    }
  ],
  theme: {
    accentColor: '#03d0eb',
  },
  font: {
    default: { google: 'Roboto' }
  },
  iconUrl: 'https://quantform.io/favicon.ico',
  logoUrl: {
    dark: 'https://quantform.io/quantform.svg',
    light: 'https://quantform.io/quantform.svg'
  },
  socials: [ 
    { 
      icon: 'github', 
      link: 'https://github.com/quantform/', 
    }, 
    { 
      icon: 'x', 
      link: 'https://x.com/hot_coffee_mod', 
    }, 
  ],
});
