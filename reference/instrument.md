---
description: >-
  Represents a trading market which is made up by two trading assets (base and
  quoted).
---

# Instrument

## Usage

### Get list of instruments <a href="#get-list-of-instruments" id="get-list-of-instruments"></a>

A method that pipes a collection of tradeable instruments. This method get updated in case of Adapter initialization.

```typescript
// print every tradeable instrument one by one:
session.instruments().pipe(tap((it) => it.forEach(console.log)));
```

### Get instrument <a href="#get-instrument" id="get-instrument"></a>

A method that pipes a [Instrument](https://developer.quantform.io/#instrument) updates specified by selector. This method get updated when commission property was patched.

```typescript
// track the rate of market maker fee for BTC-USDT on Binance:
session
  .instrument(instrumentOf("binance:btc-usdt"))
  .pipe(tap((it) => console.log("maker fee: ", it.commission.makerRate)));
```



\
