---
description: >-
  a method that pipes a Instrument updates specified by selector. This method
  get updated when commission property was patched.
---

# get instrument

#### `instrument(selector: InstrumentSelector): Observable<Instrument>`

```typescript
// track the rate of market maker fee for BTC-USDT on Binance:
session
  .instrument(instrumentOf("binance:btc-usdt"))
  .pipe(tap((it) => console.log("maker fee: ", it.commission.makerRate)));
```
