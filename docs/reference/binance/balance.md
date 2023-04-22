# Assets

The Asset represents a security that you can trade or hold in your wallet. For example, you can combine two trading assets to create a trading instrument.

## useBinanceBalance

This hook is designed to be used to retrieve the balance of a specified asset in
the user's Binance account. The function takes one argument, asset, which is an
object that represents the asset to retrieve the balance for.

If the asset is not supported by Binance, the function returns an observable that
emits assetNotSupported.

## useBinanceBalances

This hook is designed to provide a way to keep track of the balances of all assets
in a user's Binance account and respond to any changes in real-time. It returns
a read-only observable of the balances.

It uses the WebSocket to subscribe to updates to the user's Binance account.

