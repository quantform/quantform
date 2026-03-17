<p align="center"> <img src="https://raw.githubusercontent.com/quantform/quantform/main/quantform.svg" alt="quantform-logo" width="220px" /> </p> <h3 align="center">Event-driven automation runtime for financial markets and protocols</h3> <p align="center">Turn markets and protocols into event streams you can compose into automated strategies.</p> <p align="center"> <a href="https://www.quantform.io"><strong>Website</strong></a> · <a href="https://developer.quantform.io">Documentation</a> · <a href="CONTRIBUTING.md">Contributing</a> </p> <p align="center"> <a href="https://github.com/quantform/quantform/actions/workflows/release.yml"> <img src="https://github.com/quantform/quantform/actions/workflows/release.yml/badge.svg" alt="GH Actions" /> </a> <a href="LICENSE.md"> <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /> </a> </p>
<hr>

**quantform** is a runtime for building automated financial systems.

It connects markets, exchanges, and protocols, and lets you define how your system reacts to changes in real time.

Define your logic once and run it across markets, protocols, and environments.

Use it to build trading strategies, automate DeFi, or run cross-market execution — all in one place.

- **works everywhere**  
  connect centralized exchanges, DeFi protocols, and wallets in one system  

- **real-time by default**  
  react instantly to market and protocol changes  

- **one system, all environments**  
  run the same logic in backtesting and live execution  

- **built for automation**  
  go beyond trading — automate entire financial workflows 

## Example

```ts
export function useStrategy() {
  return combineLatest(
    watchPrice("BTCUSDT"),
    watchPrice("ETHUSDT")
  ).pipe(
    map(([btc, eth]) => btc.price / eth.price),
    filter(ratio => ratio > 15),
    switchMap(() => placeOrder("BTCUSDT", "BUY", 0.1))
  );
}
```

## Code of Conduct

Please read [the full text](./CODE_OF_CONDUCT.md) so that you can understand what actions will and will not be tolerated.

## Risk Warning and Disclaimer

Trading Cryptocurrencies, Futures, Forex, CFDs and Stocks involves a risk of loss. Please consider carefully if such trading is appropriate for you. Past performance is not indicative of future results. Articles and content on this website are for entertainment purposes only and do not constitute investment recommendations or advice.

## License

This project is [MIT licensed](./LICENSE.md).