# Assets

Trading assets are financial instruments that are bought and sold in the financial markets for the purpose of generating profits or income. These assets can include stocks, bonds, currencies, commodities, and derivatives, among others.

When traders buy and sell these assets, they aim to make a profit by taking advantage of the price movements that occur due to changes in market conditions, economic indicators, and other factors.

## useBinanceAsset

This function creates a WebSocket connection to the order book server and listens
for updates to the order book. Whenever new data is received, the function calls the
updateOrderBook function to update the current state of the order book.

### Usage

```typescript
const asset = useBinanceAsset(assetOf('binance:btc-usdt'))
```


## useBinanceAssets

This function creates a WebSocket connection to the order book server and listens
for updates to the order book. Whenever new data is received, the function calls the
updateOrderBook function to update the current state of the order book.

### Usage

```typescript
const assets = useBinanceAssets()
```

