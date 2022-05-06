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
  <a href="https://github.com/quantform/quantform/actions/workflows/github-deploy.yml">
    <img src="https://github.com/quantform/quantform/actions/workflows/github-deploy.yml/badge.svg" alt="GH Actions" />
  </a>&nbsp;
  <a href="LICENSE.md">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="quantform on npm" />
  </a>
</p>

<hr>

## Components

This mono-repo contains following components:

- <a href="https://www.npmjs.com/package/create-quantform-app"><img src="https://img.shields.io/npm/v/create-quantform-app.svg?logo=npm&logoColor=fff&label=create-quantform-app&color=03D1EB&style=flat-square" alt="create-quantform-app on npm" /></a>
- <a href="https://www.npmjs.com/package/@quantform/core"><img src="https://img.shields.io/npm/v/@quantform/core.svg?logo=npm&logoColor=fff&label=@quantform/core&color=03D1EB&style=flat-square" alt="quantform/core on npm" /></a>
- <a href="https://www.npmjs.com/package/@quantform/sqlite"><img src="https://img.shields.io/npm/v/@quantform/sqlite.svg?logo=npm&logoColor=fff&label=@quantform/sqlite&color=03D1EB&style=flat-square" alt="quantform/sqlite on npm" /></a>
- <a href="https://www.npmjs.com/package/@quantform/binance"><img src="https://img.shields.io/npm/v/@quantform/binance.svg?logo=npm&logoColor=fff&label=@quantform/binance&color=03D1EB&style=flat-square" alt="quantform/binance on npm" /></a>
- <a href="https://www.npmjs.com/package/@quantform/binance-future"><img src="https://img.shields.io/npm/v/@quantform/binance-future.svg?logo=npm&logoColor=fff&label=@quantform/binance-future&color=03D1EB&style=flat-square" alt="quantform/binance-future on npm" /></a>
- <a href="https://www.npmjs.com/package/@quantform/studio"><img src="https://img.shields.io/npm/v/@quantform/studio.svg?logo=npm&logoColor=fff&label=@quantform/studio&color=03D1EB&style=flat-square" alt="quantform/studio on npm" /></a>

## Documentation

You can find the documentation [on the website](https://developer.quantform.io).

## Introduction

The quantform is a framework designed to automate trading on traditional, crypto centralized/decentralized markets. The main goal of this project is to allow express your strategy in declarative/reactive way and provide a solution to trade at the same time across multiple exchanges and instruments.

The framework is bases on Node.js with minimum dependencies to meet requirements. Before start you should know TypeScript and should be familiar with RxJS solution.

Please notice, this project is still in development process.

## What this project is not

The general purpose of quantform is to automate your long-term and short-term investments. It's not a high frequency trading solution, instead this project is focused to provide simple and useful tools with acceptable performance aspect.

## List of features

Here is a list of general features:

- Ability to execute strategies in paper mode, backtest mode and live mode.
- Provide an access to user account and market data via streams.
- Manage local store of orderbook, trades, balances and orders.
- Dedicated command line tools with ability to execute user defined tasks.
- Storage obligated to persist strategy state between multiple sessions.
- Editor app designed for rendering measurements to debug and analyze strategy execution on the fly.
- Standard library of basic technical analysis indicators.

## Sample Code

```ts
/**
 * buy 0.1 ETH on Binance when SMA(33) crossover SMA(99) on H1 candle.
 **/
export default (session: Session) => {
  const instrument = instrumentOf('binance:eth-usdt');
  const candle$ = session.trade(instrument).pipe(
    candle(Timeframe.H1, it => it.rate),
    share()
  );

  return combineLatest([
    candle$.pipe(sma(33, it => it.close)),
    candle$.pipe(sma(99, it => it.close))
  ]).pipe(
    filter(([[, short], [, long]]) => short > long),
    take(1),
    map(() => session.open(Order.market(instrument, 0.1)))
  );
};
```

## Minimum Example

Scaffold a new sample project in project directory:

```
npx create-quantform-app
```

Download historical data for backtest purposes:

```
yarn run qf pull ./strategy.ts 'binance:btc-usdt'
```

Execute backtest session:

```
yarn run qf test ./strategy.ts
```

## Code of Conduct

Please read [the full text](./CODE_OF_CONDUCT.md) so that you can understand what actions will and will not be tolerated.

## Risk Warning and Disclaimer

Trading Cryptocurrencies, Futures, Forex, CFDs and Stocks involves a risk of loss. Please consider carefully if such trading is appropriate for you. Past performance is not indicative of future results. Articles and content on this website are for entertainment purposes only and do not constitute investment recommendations or advice.

## License

This project is [MIT licensed](./LICENSE.md).
