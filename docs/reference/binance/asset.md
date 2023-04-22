# Assets

Binance assets are represented by ticker symbols, which are standardized codes used to identify specific assets on the exchange. These ticker symbols are used in trading pairs, which represent the exchange rate between two assets. For example, the trading pair BTC/USDT represents the exchange rate between Bitcoin and Tether, a stablecoin that is pegged to the US dollar.

## useBinanceAsset

The useBinanceAsset function is a React Hook that retrieves a specific asset from the
list of assets available on the Binance cryptocurrency exchange. It takes an asset selector
object as input, which is used to identify the asset to be retrieved.

The function returns an Observable stream that emits either a readonly Asset object
representing the specified asset or a value of "missed" if the asset cannot be found.

To retrieve the asset, the function uses the useBinanceAssets hook to obtain the list
of available assets on Binance. It then uses the RxJS map operator to transform the
list into a single Asset object that corresponds to the specified asset selector.

### Usage

```typescript
const asset = useBinanceAsset(assetOf('binance:btc-usdt'))
```


## useBinanceAssets

The useBinanceAssets function is a hook that retrieves a list of assets available on
the Binance cryptocurrency exchange. It returns an Observable stream that emits a single
Record object containing key-value pairs of assets, where the key is the asset's ID and
the value is an instance of the Asset class.

To create the list of assets, the function uses the useBinanceInstruments hook to retrieve
a list of trading instruments on Binance. It then extracts the base and quote assets from
each instrument and adds them to the list of assets.

### Usage

```typescript
const assets = useBinanceAssets()
```

