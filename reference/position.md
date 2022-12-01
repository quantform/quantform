---
description: Represents a position opened on derivative market.
---

# Position

## Members

|                                              <p><strong><code>timestamp</code></strong><br>number</p> | last update at                              |
| ----------------------------------------------------------------------------------------------------: | ------------------------------------------- |
|                                                     <p><strong><code>id</code></strong><br>string</p> | unique local id of position                 |
|               <p><strong><code>instrument</code></strong><br><a href="instrument/">Instrument</a></p> | related instrument                          |
|    <p><strong><code>averageExecutionRate</code></strong><br><strong><code></code></strong>decimal</p> | position entry rate                         |
|                                                  <p><strong><code>size</code></strong><br>decimal</p> | size of the position                        |
|                 <p><strong><code>leverage</code></strong><br><strong><code></code></strong>number</p> | leverage of position                        |
| <p><strong><code>estimatedUnrealizedPnL?</code></strong><br><strong><code></code></strong>decimal</p> | current estimated unrealized profit or loss |

## Usage

Subscribe to position changes

```typescript
session
  .position(instrumentOf("binance:btc-usdt"))
  .pipe(tap((it) => `position changed: ${it.estimatedUnrealizedPnL}`));
```
