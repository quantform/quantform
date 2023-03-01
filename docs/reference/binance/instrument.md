# Assets

The Asset represents a security that you can trade or hold in your wallet. For example, you can combine two trading assets to create a trading instrument.

## useBinanceInstrument

Subscribes for specific instrument changes. Under the hood, the subscription will
request a list of all tradeable instruments and return the specific one.

### Usage

```typescript
const btc_usdt = useBinanceInstrument(instrumentOf('binance:btc-usdt'));
```

