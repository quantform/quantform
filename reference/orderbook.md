---
description: Provides an access to pending buy and sell orders on the specific market.
---

# Orderbook

## Members

|                                <p><strong><code>timestamp</code></strong><br>number</p> | the last update time                                       |
| --------------------------------------------------------------------------------------: | ---------------------------------------------------------- |
| <p><strong><code>instrument</code></strong><br><a href="instrument/">Instrument</a></p> | related instrument                                         |
|     <p><strong><code>asks</code></strong><br><a href="orderbook/depth.md">Depth</a></p> | queue of the pending sell orders, ordered by the best rate |
|     <p><strong><code>bids</code></strong><br><a href="orderbook/depth.md">Depth</a></p> | queue of the pending buy orders, ordered by the best rate  |



{% hint style="warning" %}
The liquidity of some markets can be limited to L1 orderbook data.
{% endhint %}

## Usage

Subscribe to orderbook changes

```typescript
session
  .orderbook(instrumentOf("binance:btc-usdt"))
  .pipe(tap((it) => `current best buy offer: ${it.bids.rate}`));
```
