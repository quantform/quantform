# Assets

Binance assets are represented by ticker symbols, which are standardized codes used to identify specific assets on the exchange. These ticker symbols are used in trading pairs, which represent the exchange rate between two assets. For example, the trading pair BTC/USDT represents the exchange rate between Bitcoin and Tether, a stablecoin that is pegged to the US dollar.

## useBinanceAsset

The `useBinanceAsset` function is a utility function that returns a stream of a specific
asset from Binance assets. It takes in an `AssetSelector` object that represents the
desired asset and uses the `useBinanceAssets` hook to retrieve a stream of all Binance
assets. The function then maps over the stream to find the asset with the provided ID.
If the asset is not found, the function throws a `MissingAssetError` with the original
`AssetSelector` object as an argument.

```typescript
const asset = useBinanceAsset(assetOf('binance:btc-usdt'))
```


## useBinanceAssets

The `useBinanceAssets` function is a utility function that retrieves all available assets
from Binance and returns them as an Observable. It does this by using the
`useBinanceInstruments` hook to retrieve all trading pairs on Binance, and then extracts
the base and quote assets from each pair. The function then reduces these assets into a
single object that maps each asset's ID to an `Asset` object.

```typescript
const assets = useBinanceAssets()
```

