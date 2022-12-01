---
description: >-
  Represents a security that you can trade or hold in your wallet. For example,
  you can combine two trading assets to create a trading instrument.
---

# Asset

## Members

| <p><strong><code>timestamp</code></strong><br>number</p> | the last updated time of component |
| -------------------------------------------------------: | ---------------------------------- |
|      <p><strong><code>name</code></strong><br>string</p> | the unified name of the asset      |
|   <p><strong><code>adapter</code></strong><br>string</p> | the adapter name                   |
|     <p><strong><code>scale</code></strong><br>number</p> | numeric precision                  |
| <p><strong><code>tickSize</code></strong><br>decimal</p> | minimum price movement             |

|    **`toString()`** | returns unified asset format                |
| ------------------: | ------------------------------------------- |
| **`fixed(number)`** | trims a number to the asset precision       |
| **`floor(number)`** | rounds down a number to the asset precision |
|  **`celi(number)`** | rounds up a number to the asset precision   |

## Usage

Create an asset selector based on unified string notation

```typescript
// returns a selector related to Binance spot market and USDT asset.
const selector = assetOf("binance:usdt");
```

Subscribe to asset updates and print number of decimals

```typescript
session
  .asset(assetOf("binance:usdt"))
  .pipe(tap((it) => console.log(`number of decimals: `, it.scale)));
```

Round an order quantity to exchange decimal places

```typescript
const order = Order.market(instrument, instrument.base.floor(0.123456789));
```
