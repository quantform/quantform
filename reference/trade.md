---
description: >-
  Simple trade or ticker executed on the market, it's a match of buyer and
  seller of the same asset.
---

# Trade

## Members

|                                                              <p><strong><code>timestamp</code></strong><br>number</p> | the time when execution occur |
| --------------------------------------------------------------------------------------------------------------------: | ----------------------------- |
| <p><strong><code>instrument</code></strong><br><strong><code></code></strong><a href="instrument/">Instrument</a></p> | related instrument            |
|                                                                  <p><strong><code>rate</code></strong><br>decimal</p> | trade execution price         |
|                                                              <p><strong><code>quantity</code></strong><br>decimal</p> | trade execution quantity      |

## Usage

Subscribe to instrument ticker

```typescript
session
  .trade(instrumentOf("binance:btc-usdt"))
  .pipe(tap((it) => console.log(`Last price: ${it.rate}`)));
```

Build a five minute candle based on market trades

```typescript
session.trade(instrumentOf('binance:btc-usdt'))
  .pipe(
    candle(Timeframe.M5, it => it.rate),
    tap(it => console.log($`{new Date(it.timestamp)} close price is: ${it.close}`)
  );
```

Calculate current ratio of two instruments (pair) for every occurred trade

```typescript
combineLatest([
  session.trade(instrumentOf("binance:btc-usdt")),
  session.trade(instrumentOf("binance:eth-usdt")),
]).pipe(
  map(([btc, eth]) => btc.rate / eth.rate),
  tap((it) => `current rate is: ${it}`)
);
```
