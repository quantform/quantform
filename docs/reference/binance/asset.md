# Assets

The Asset represents a security that you can trade or hold in your wallet. For example, you can combine two trading assets to create a trading instrument.

## useBinanceAsset

This function creates a WebSocket connection to the order book server and listens
for updates to the order book. **Whenever** new data is received, the function calls the
updateOrderBook function to update the current state of the order book.

### Usage

```typescript
const asset = useBinanceAsset(assetOf('binance:btc-usdt'))
```

