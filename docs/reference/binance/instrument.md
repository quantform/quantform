# Instruments

Binance instrument refers to a trading pair that is available on the Binance exchange. A trading pair represents the exchange rate between two assets, and it is denoted by a ticker symbol that is standardized across the exchange.

For example, the trading pair BTC/USDT represents the exchange rate between Bitcoin and Tether, a stablecoin that is pegged to the US dollar. In this case, BTC is the base asset, and USDT is the quote asset.

Binance offers a wide range of trading pairs, including major cryptocurrencies like Bitcoin, Ethereum, and Binance Coin, as well as many lesser-known altcoins. Trading pairs can be bought or sold on Binance, allowing users to speculate on the price movements of different cryptocurrencies and potentially make a profit.

In summary, Binance instrument is a term used to describe the trading pairs that are available on the Binance exchange, and it is an essential concept to understand for anyone looking to trade cryptocurrencies on Binance.

## useBinanceInstrument

Subscribes for specific instrument changes. Under the hood, the subscription will
request a list of all tradeable instruments and return the specific one.

### Usage

```typescript
const btc_usdt = useBinanceInstrument(instrumentOf('binance:btc-usdt'));
```


## useInstruments

Subscribes for specific instrument changes. Under the hood, the subscription will
request a list of all tradeable instruments and return the specific one.

### Usage

```typescript
const btc_usdt = useBinanceInstrument(instrumentOf('binance:btc-usdt'));
```

