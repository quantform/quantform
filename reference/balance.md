---
description: Represents account balance.
---

# Balance

## Members

|                   <p><strong><code>timestamp</code></strong><br>number</p> | the last update time                                                                 |
| -------------------------------------------------------------------------: | ------------------------------------------------------------------------------------ |
| <p><strong><code>asset</code></strong><br><a href="asset.md">Asset</a></p> | related asset                                                                        |
|                        <p><strong><code>free</code></strong><br>number</p> | available quantity to trade                                                          |
|                      <p><strong><code>locked</code></strong><br>number</p> | the sum of locked quantity in opened orders  and required funding for open positions |
|                       <p><strong><code>total</code></strong><br>number</p> | total equity of asset                                                                |

## Usage

Subscribe to balance changes

```typescript
session
  .balance(assetOf("binance:btc"))
  .pipe(tap((it) => `current free balance of BTC: ${it.free}`));
```
