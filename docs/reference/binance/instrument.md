# Instruments

Binance instrument refers to a trading pair that is available on the Binance exchange. A trading pair represents the exchange rate between two assets, and it is denoted by a ticker symbol that is standardized across the exchange.

For example, the trading pair BTC/USDT represents the exchange rate between Bitcoin and Tether, a stablecoin that is pegged to the US dollar. In this case, BTC is the base asset, and USDT is the quote asset.

In summary, Binance instrument is a term used to describe the trading pairs that are available on the Binance exchange, and it is an essential concept to understand for anyone looking to trade cryptocurrencies on Binance.

## useBinanceInstrument

The `useBinanceInstrument` function is a utility function that retrieves a specific
instrument from Binance and returns it as an Observable. It takes an `InstrumentSelector`
object as a parameter, representing the desired instrument, and uses the
`useBinanceInstruments` hook to fetch all available instruments from Binance.
The function then searches for the instrument with the provided ID and returns it.
If the instrument is not found, the function throws a `MissingInstrumentError` with
the original `InstrumentSelector` object as an argument.

```typescript
const btc_usdt = useBinanceInstrument(instrumentOf('binance:btc-usdt'));
```


## useInstruments

The `useBinanceInstruments` function is a utility function that retrieves and
processes instrument data from Binance. It returns an Observable that emits an
array of `Instrument` objects. The function combines the results of two
observables: `useBinanceInstrumentsRequest()`, which retrieves instrument data
from Binance, and `useBinanceCommission()`, which retrieves commission data.

The function maps over the received instrument data, extracting relevant
information such as the timestamp, base and quote assets, symbol, and
commission. It also calculates the scaling factors for the assets based on
the filters associated with each instrument. These filters include price and
lot size restrictions, which determine the decimal places for each asset.

```typescript
const btc_usdt = useBinanceInstrument(instrumentOf('binance:btc-usdt'));
```

