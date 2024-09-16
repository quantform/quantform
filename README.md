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

## Components

This mono-repo contains following components:

- <a href="https://www.npmjs.com/package/@quantform/core"><img src="https://img.shields.io/npm/v/@quantform/core.svg?logo=npm&logoColor=fff&label=@quantform/core&color=03D1EB&style=flat-square" alt="quantform/core on npm" /></a>
- <a href="https://www.npmjs.com/package/@quantform/ethereum"><img src="https://img.shields.io/npm/v/@quantform/ethereum.svg?logo=npm&logoColor=fff&label=@quantform/ethereum&color=03D1EB&style=flat-square" alt="quantform/ethereum on npm" /></a>
- <a href="https://www.npmjs.com/package/@quantform/sqlite"><img src="https://img.shields.io/npm/v/@quantform/sqlite.svg?logo=npm&logoColor=fff&label=@quantform/sqlite&color=03D1EB&style=flat-square" alt="quantform/sqlite on npm" /></a>
- <a href="https://www.npmjs.com/package/@quantform/binance"><img src="https://img.shields.io/npm/v/@quantform/binance.svg?logo=npm&logoColor=fff&label=@quantform/binance&color=03D1EB&style=flat-square" alt="quantform/binance on npm" /></a>

## Documentation

You can find the documentation [on the website](https://developer.quantform.io).

## Brief

Quantform is a framework designed to automate trading strategies on both traditional and crypto centralized/decentralized markets. The framework allows traders to express their trading strategy in a declarative/reactive way, making it easier to define and modify their trading rules. With support for multiple exchanges and instruments, traders can trade across different markets simultaneously.

The tool is designed to automate your long-term and short-term investments. Unlike high frequency trading solutions, this project is focused on providing simple and useful tools with acceptable performance aspects. With this tool, you can automate your investment strategies and reduce the time and effort needed to manage your portfolio.

The framework provides support for multiple exchanges and instruments, allowing traders to trade across different markets simultaneously. This means that traders can take advantage of market inefficiencies and arbitrage opportunities, and reduce their exposure to individual exchange risks.

The framework is based on Node.js with minimum dependencies to meet requirements, making it efficient and reliable. This ensures that the framework can handle large volumes of data and execute trades in real-time, while minimizing the risk of crashes and errors.

Please note that the Quantform framework is still in development and may contain bugs or limitations. For more information on how to use the framework, please refer to the documentation, which provides detailed instructions, examples, and best practices.


## List of features

Here is a list of general features:

**Real-Time Market Data Feeds**: Access a variety of real-time market data feeds for major cryptocurrencies from both centralized and decentralized exchanges. These feeds provide timely and relevant market data, enabling traders to make informed trading decisions in the dynamic and fast-moving world of crypto markets.

**Real-Time Account Data**: Provides real-time updates on account data, such as balance, open orders, and trade history. Traders can stay up-to-date on their account activity and adjust their trading strategies accordingly.

**Robust Technical Indicators**: Leverage a wide range of technical indicators, such as moving averages, Bollinger bands, and RSI, to analyze market trends and identify potential trading opportunities. These indicators are designed to be flexible and adaptable to various trading strategies.

**Powerful Backtesting Framework**: Utilize a comprehensive backtesting framework to test trading algorithms against historical market data. This framework enables traders to evaluate the performance of their algorithms and identify areas for improvement.

**Real-Time Live Trading**: Execute trades in real-time using trading algorithms with the live trading framework. This feature automates trading strategies and reduces the need for manual intervention.

**Stable and Reliable**: Designed to run continuously for weeks and months without crashing or encountering other issues. It is designed to be stable and reliable, providing traders with the confidence they need to implement trading strategies.

**Efficient Codebase**: Streamlined and optimized for performance, reducing the likelihood of errors and making it easier to maintain. The efficient codebase enables traders and developers to quickly implement and modify trading strategies.


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