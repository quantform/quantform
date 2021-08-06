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
  <a href="https://docs.quantform.io/">Documentation</a>
  ·
  <a href="CONTRIBUTING.md">Contributing Guidelines</a>
  <br>
  <br>
</p>

<p align="center">
  <a href="https://github.com/quantform/quantform/actions/workflows/github-publish.yml">
    <img src="https://github.com/quantform/quantform/actions/workflows/github-publish.yml/badge.svg" alt="GH Actions" />
  </a>&nbsp;
  <a href="LICENSE.md">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="quantform on npm" />
  </a>
</p>

<hr>

## Components

This mono-repo contains following components:

- <a href="https://www.npmjs.com/package/@quantform/core"><img src="https://img.shields.io/npm/v/@quantform/core.svg?logo=npm&logoColor=fff&label=@quantform/core&color=03D1EB&style=flat-square" alt="quantform/core on npm" /></a>
- <a href="https://www.npmjs.com/package/@quantform/sqlite"><img src="https://img.shields.io/npm/v/@quantform/sqlite.svg?logo=npm&logoColor=fff&label=@quantform/sqlite&color=03D1EB&style=flat-square" alt="quantform/sqlite on npm" /></a>
- <a href="https://www.npmjs.com/package/@quantform/binance"><img src="https://img.shields.io/npm/v/@quantform/binance.svg?logo=npm&logoColor=fff&label=@quantform/binance&color=03D1EB&style=flat-square" alt="quantform/binance on npm" /></a>
- <a href="https://www.npmjs.com/package/@quantform/binance-future"><img src="https://img.shields.io/npm/v/@quantform/binance-future.svg?logo=npm&logoColor=fff&label=@quantform/binance-future&color=03D1EB&style=flat-square" alt="quantform/binance-future on npm" /></a>
- <a href="https://www.npmjs.com/package/@quantform/binance-delivery"><img src="https://img.shields.io/npm/v/@quantform/binance-delivery.svg?logo=npm&logoColor=fff&label=@quantform/binance-delivery&color=03D1EB&style=flat-square" alt="quantform/binance-delivery on npm" /></a>
- <a href="https://www.npmjs.com/package/@quantform/oanda"><img src="https://img.shields.io/npm/v/@quantform/oanda.svg?logo=npm&logoColor=fff&label=@quantform/oanda&color=03D1EB&style=flat-square" alt="quantform/oanda on npm" /></a>
- <a href="https://www.npmjs.com/package/@quantform/uniswap"><img src="https://img.shields.io/npm/v/@quantform/uniswap.svg?logo=npm&logoColor=fff&label=@quantform/uniswap&color=03D1EB&style=flat-square" alt="quantform/uniswap on npm" /></a>
- <a href="https://www.npmjs.com/package/@quantform/xtb"><img src="https://img.shields.io/npm/v/@quantform/xtb.svg?logo=npm&logoColor=fff&label=@quantform/xtb&color=03D1EB&style=flat-square" alt="quantform/xtb on npm" /></a>

## Documentation

You can find the documentation [on the website](https://docs.quantform.io).

## Sample Code

```ts
class CrossoverBehaviour implements Behaviour {
  constructor(
    private readonly instrument: InstrumentSelector,
    private readonly quantity: number,
    private readonly timeframe: number,
    private readonly period: { short: number; long: number }
  ) {}

  describe(session: Session): Observable<any> {
    const aggregate = session
      .trade(this.instrument)
      .pipe(candle(this.timeframe, it => it.rate));

    return combineLatest([
      aggregate.pipe(sma(this.period.short, it => it.close)),
      aggregate.pipe(sma(this.period.long, it => it.close))
    ]).pipe(
      filter(([short, long]) => short.value > long.value),
      take(1),
      map(() => session.open(Order.buyMarket(this.instrument, this.quantity)))
    );
  }
}

// simply buy 0.1 of ETH/USDT on Binance when SMA(99) crossover SMA(33)
session.install(
  new CrossoverBehaviour(instrumentOf('binance:eth-usdt'), 0.1, Timeframe.H1, {
    short: 33,
    long: 99
  })
);
```

## Minimum Example

Install command line interface globally:

```
npm i @quantform/cli -g
```

Scaffold a new sample project in project directory:

```
qf new
```

Download historical data for backtest purposes:

```
qf feed 'binance:btc-usdt' '2019-01-01' '2021-01-01'
```

Execute backtest session:

```
qf backtest
```

## Code of Conduct

Please read [the full text](./CODE_OF_CONDUCT.md) so that you can understand what actions will and will not be tolerated.

## Risk Warning and Disclaimer

Trading Cryptocurrencies, Futures, Forex, CFDs and Stocks involves a risk of loss. Please consider carefully if such trading is appropriate for you. Past performance is not indicative of future results. Articles and content on this website are for entertainment purposes only and do not constitute investment recommendations or advice.

## License

This project is [MIT licensed](./LICENSE.md).
