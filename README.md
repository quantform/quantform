<p align="center">
  <img src="https://raw.githubusercontent.com/quantform/quantform/main/quantform.svg" alt="quantform-logo" width="220px" height="100px"/>
  <br>
</p>
<h3 align="center">Node.js library for building systematic trading strategies in reactive way.</h3>
<p align="center">
  <i>Use the power of TypeScript and Reactive Programming to research, develop and test your <br />market-winning short-term and long-term investments.</i>
  <br>
</p>

<p align="center">
  <a href="https://www.quantform.io"><strong>www.quantform.io</strong></a>
  <br>
</p>

<p align="center">
  <a href="https://developer.quantform.io/">Documentation</a>
  ·
  <a href="CONTRIBUTING.md">Contributing Guidelines</a>
  <br>
  <br>
</p>

<p align="center">
  <a href="https://github.com/quantform/quantform/actions/workflows/release.yml">
    <img src="https://github.com/quantform/quantform/actions/workflows/release.yml/badge.svg" alt="GH Actions" />
  </a>&nbsp;
  <a href="LICENSE.md">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="quantform on npm" />
  </a>
</p>

<hr>

The **quantform** is a trading automation framework designed for crypto markets, supporting centralized and decentralized exchanges. It enables traders to define strategies in a declarative/reactive way, simplifying modifications and execution. Unlike high-frequency trading solutions, quantform focuses on usability and efficiency, helping users automate both long-term and short-term investments. 

Built on Node.js with minimal dependencies, it ensures reliability and performance for handling large data volumes and real-time trading. The framework also facilitates multi-exchange trading to leverage market inefficiencies and reduce risks.

- **real-time market data** provide traders with up-to-the-moment market, this enables traders to make informed adjustments to their strategies as market conditions change.
- **real-time account data** offers instant updates on account balances, open orders, and trade history. This allows traders to monitor their account activity.
- **paper trading and backetsting** to test trading algorithms against historical market data. This enables traders to evaluate the performance of their algorithms and identify areas for improvement.
- **stable and reliable** built for long-term operation, the system runs continuously for weeks or months without crashes or disruptions. Its stability ensures traders can execute strategies with confidence, minimizing downtime and technical issues.

## Components

This mono-repo contains following components:

- <a href="https://www.npmjs.com/package/@quantform/core"><img src="https://img.shields.io/npm/v/@quantform/core.svg?logo=npm&logoColor=fff&label=@quantform/core&color=03D1EB&style=flat-square" alt="quantform/core on npm" /></a>
- <a href="https://www.npmjs.com/package/@quantform/ethereum"><img src="https://img.shields.io/npm/v/@quantform/ethereum.svg?logo=npm&logoColor=fff&label=@quantform/ethereum&color=03D1EB&style=flat-square" alt="quantform/ethereum on npm" /></a>
- <a href="https://www.npmjs.com/package/@quantform/sqlite"><img src="https://img.shields.io/npm/v/@quantform/sqlite.svg?logo=npm&logoColor=fff&label=@quantform/sqlite&color=03D1EB&style=flat-square" alt="quantform/sqlite on npm" /></a>
- <a href="https://www.npmjs.com/package/@quantform/binance"><img src="https://img.shields.io/npm/v/@quantform/binance.svg?logo=npm&logoColor=fff&label=@quantform/binance&color=03D1EB&style=flat-square" alt="quantform/binance on npm" /></a>
- <a href="https://www.npmjs.com/package/@quantform/hyperliquid"><img src="https://img.shields.io/npm/v/@quantform/hyperliquid.svg?logo=npm&logoColor=fff&label=@quantform/hyperliquid&color=03D1EB&style=flat-square" alt="quantform/hyperliquid on npm" /></a>
- <a href="https://www.npmjs.com/package/@quantform/telegram"><img src="https://img.shields.io/npm/v/@quantform/telegram.svg?logo=npm&logoColor=fff&label=@quantform/telegram&color=03D1EB&style=flat-square" alt="quantform/telegram on npm" /></a>


## Documentation

You can find the documentation [on the website](https://developer.quantform.io).


## Sample Code

```ts
/**
 * Subscribe for given instrument market data and aggregate the volume.
 */
export function whenTradeVolumeAccumulated(instrument: InstrumentSelector) {
  const { whenTrade } = useBinance();
  const { error } = useLogger(whenTradeVolumeAccumulated.name);

  let volume = d.Zero;

  return whenTrade(instrument).pipe(
    map(it => {
      volume = volume.add(it.quantity);

      return volume;
    }),
    catchError(e => {
      error('connection lost...');

      return throwError(() => e);
    }),
    retry({ count: 5, delay: 1000 })
  );
}

/**
 * Describe strategy behavior
 */
export default strategy(() => {
  behavior(() => {
    const { info } = useLogger('market-data-streaming');

    return zip([
      whenTradeVolumeAccumulated(instrumentOf('binance:btc-usdt')),
      whenTradeVolumeAccumulated(instrumentOf('binance:eth-usdt'))
    ]).pipe(tap(([btc, eth]) => info(`accumulated volume: ${btc} BTC, ${eth} ETH`)));
  });

  return [
    ...binance({}),
    sqlite()
  ];
});
```

## Minimum Example

Scaffold a new sample project in project directory:

```
npx create-quantform-app .
```

Execute backtest session:

```
npm start
```

## Code of Conduct

Please read [the full text](./CODE_OF_CONDUCT.md) so that you can understand what actions will and will not be tolerated.

## Risk Warning and Disclaimer

Trading Cryptocurrencies, Futures, Forex, CFDs and Stocks involves a risk of loss. Please consider carefully if such trading is appropriate for you. Past performance is not indicative of future results. Articles and content on this website are for entertainment purposes only and do not constitute investment recommendations or advice.

## License

This project is [MIT licensed](./LICENSE.md).